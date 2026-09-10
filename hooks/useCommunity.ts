import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";

export const useCommunity = (activeTab?: string) => {
  const queryClient = useQueryClient();
  const { profile } = useUser();
  const userId = profile?.data?.id;

  // This key is used to target the specific list being displayed
  const queryKey = ["community", "posts", activeTab];

  // 1. Fetch Posts
  const postsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const tabParam = activeTab?.toLowerCase().replace(" ", "_") || "all";
      const res = await api.get(`/api/community/posts/?tab=${tabParam}`);
      return res.data;
    },
    enabled: !!activeTab,
  });

  // 2. Fetch Following List
  const followingQuery = useQuery({
    queryKey: ["community", "following"],
    queryFn: async () => {
      const res = await api.get("/api/community/following-users/");
      return res.data;
    },
  });

  // 3. Create Post Mutation with Optimistic Update (Text Only)
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/api/community/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onMutate: async (formData: FormData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      // Optimistically add the new post to the top (text only, no image preview)
      const optimisticPost = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: formData.get("content"),
        image_url: null, // Don't try to show image preview to avoid blob URL error
        created_at: new Date().toISOString(),
        user: {
          id: userId,
          full_name: profile?.data?.full_name || "You",
          profile_picture_url: profile?.data?.profile_picture_url || null,
        },
        likes: [],
        likes_count: 0,
        comments_count: 0,
      };

      queryClient.setQueryData(queryKey, (old: any[] = []) => [
        optimisticPost,
        ...old,
      ]);

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKey, context?.previousPosts);
    },
    onSuccess: () => {
      // Refresh to get the real post data from server with image
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  // 4. Follow/Unfollow with Optimistic Update
  const followMutation = useMutation({
    mutationFn: async (user: any) => {
      return await api.post(`/api/community/users/${user.id}/follow/`);
    },
    onMutate: async (clickedUser: any) => {
      await queryClient.cancelQueries({ queryKey: ["community", "following"] });
      const previousFollowing = queryClient.getQueryData([
        "community",
        "following",
      ]);

      queryClient.setQueryData(
        ["community", "following"],
        (old: any[] = []) => {
          const isAlreadyFollowing = old.some(
            (u) => Number(u.id) === Number(clickedUser.id)
          );
          if (isAlreadyFollowing) {
            return old.filter((u) => Number(u.id) !== Number(clickedUser.id));
          } else {
            return [
              ...old,
              {
                id: clickedUser.id,
                full_name: clickedUser.full_name,
                profile_picture_url: clickedUser.profile_picture_url,
              },
            ];
          }
        }
      );
      return { previousFollowing };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(
        ["community", "following"],
        context?.previousFollowing
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "following"] });
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  // 5. Like Post with FULL OPTIMISTIC UPDATE (Fixed userId issue)
  const likePostMutation = useMutation({
    mutationFn: async (postId: string | number) => {
      return await api.post(`/api/community/posts/${postId}/like/`);
    },
    onMutate: async (postId) => {
      // Ensure we have userId before proceeding
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Cancel refetches
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      // Update all query keys (all tabs)
      queryClient.setQueriesData(
        { queryKey: ["community", "posts"] },
        (old: any) => {
          if (!old) return old;
          return old.map((post: any) => {
            if (String(post.id) === String(postId)) {
              const isLiked = post.likes?.some(
                (l: any) => String(l.user?.id) === String(userId)
              );
              return {
                ...post,
                likes_count: isLiked
                  ? Math.max(0, post.likes_count - 1)
                  : post.likes_count + 1,
                likes: isLiked
                  ? post.likes.filter(
                      (l: any) => String(l.user?.id) !== String(userId)
                    )
                  : [...(post.likes || []), { user: { id: userId } }],
              };
            }
            return post;
          });
        }
      );

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKey, context?.previousPosts);
    },
    onSettled: () => {
      // Revalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  // 6. Delete Post with FULL OPTIMISTIC UPDATE
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string | number) => {
      return await api.delete(`/api/community/posts/details/${postId}/`);
    },
    onMutate: async (postId) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      // Remove the post immediately from all tabs
      queryClient.setQueriesData(
        { queryKey: ["community", "posts"] },
        (old: any) => {
          return old?.filter((post: any) => String(post.id) !== String(postId));
        },
      );

      return { previousPosts };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKey, context?.previousPosts);
      if (__DEV__) console.log("err", err?.response?.data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  // 7. Update (Edit) Post Mutation with Optimistic Update (Text Only)
  const updatePostMutation = useMutation({
    mutationFn: async ({
      postId,
      formData,
    }: {
      postId: string | number;
      formData: FormData;
    }) => {
      try {
        if (__DEV__) console.log("Sending update request for post:", postId);
        const res = await api.put(
          `/api/community/posts/details/${postId}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          },
        );
        if (__DEV__) console.log("Update response:", res.data);
        return res.data;
      } catch (error: any) {
        if (__DEV__) console.error(
          "API update error:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    onMutate: async ({ postId, formData }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      // Optimistically update only text content (not image to avoid blob URL issues)
      queryClient.setQueriesData(
        { queryKey: ["community", "posts"] },
        (old: any) => {
          if (!old) return old;
          return old.map((post: any) => {
            if (String(post.id) === String(postId)) {
              const contentUpdate = formData.get("content");
              return {
                ...post,
                // Only update content optimistically
                content: contentUpdate || post.content,
                updated_at: new Date().toISOString(),
                // Keep existing image - it will update after server response
              };
            }
            return post;
          });
        },
      );

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKey, context?.previousPosts);
    },
    onSuccess: () => {
      // Refresh to get the real updated data with new image
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  return {
    posts: postsQuery.data || [],
    followingList: followingQuery.data || [],
    isLoading: postsQuery.isLoading,
    isCreating: createPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    // ACTIONS
    createPost: createPostMutation.mutateAsync,
    followUser: followMutation.mutateAsync,
    likePost: likePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    refetch: async () => {
      await Promise.all([postsQuery.refetch(), followingQuery.refetch()]);
    },
  };
};