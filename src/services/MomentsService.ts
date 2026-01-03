/**
 * MomentsService - Manages user posts, comments, likes, and shares
 */

export interface MomentPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  likes: string[]; // Array of user IDs who liked
  comments: MomentComment[];
  shares: number;
  createdAt: Date;
}

export interface MomentComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Date;
}

class MomentsServiceClass {
  private posts: Map<string, MomentPost> = new Map();

  /**
   * Create a new post
   */
  createPost(
    userId: string,
    userName: string,
    userAvatar: string,
    content: string,
    images: string[] = []
  ): MomentPost {
    const post: MomentPost = {
      id: `post_${Date.now()}`,
      userId,
      userName,
      userAvatar,
      content,
      images,
      likes: [],
      comments: [],
      shares: 0,
      createdAt: new Date(),
    };
    this.posts.set(post.id, post);
    return post;
  }

  /**
   * Get all posts for a user
   */
  getUserPosts(userId: string): MomentPost[] {
    const userPosts: MomentPost[] = [];
    this.posts.forEach((post) => {
      if (post.userId === userId) {
        userPosts.push(post);
      }
    });
    return userPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all posts (for timeline)
   */
  getAllPosts(): MomentPost[] {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get a single post by ID
   */
  getPost(postId: string): MomentPost | undefined {
    return this.posts.get(postId);
  }

  /**
   * Like/Unlike a post
   */
  toggleLike(postId: string, userId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      return false;
    } else {
      // Like
      post.likes.push(userId);
      return true;
    }
  }

  /**
   * Add a comment to a post
   */
  addComment(
    postId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string
  ): MomentComment | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    const comment: MomentComment = {
      id: `comment_${Date.now()}`,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    return comment;
  }

  /**
   * Delete a comment
   */
  deleteComment(postId: string, commentId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    const commentIndex = post.comments.findIndex((c) => c.id === commentId);
    if (commentIndex > -1) {
      post.comments.splice(commentIndex, 1);
      return true;
    }
    return false;
  }

  /**
   * Share a post (increment share count)
   */
  sharePost(postId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.shares += 1;
    return true;
  }

  /**
   * Delete a post
   */
  deletePost(postId: string, userId: string): boolean {
    const post = this.posts.get(postId);
    if (!post || post.userId !== userId) return false;

    this.posts.delete(postId);
    return true;
  }

  /**
   * Get like count for a post
   */
  getLikeCount(postId: string): number {
    const post = this.posts.get(postId);
    return post ? post.likes.length : 0;
  }

  /**
   * Check if user liked a post
   */
  hasUserLiked(postId: string, userId: string): boolean {
    const post = this.posts.get(postId);
    return post ? post.likes.includes(userId) : false;
  }

  /**
   * Get comment count for a post
   */
  getCommentCount(postId: string): number {
    const post = this.posts.get(postId);
    return post ? post.comments.length : 0;
  }

  /**
   * Initialize demo posts
   */
  initializeDemoPosts(): void {
    // Demo post 1
    this.createPost(
      'user123',
      'أحمد الأردني',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
      'يوم رائع في عمان! 🌟 استمتعت بوقتي في المقهى الجديد',
      [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
      ]
    );

    // Demo post 2
    this.createPost(
      'user456',
      'سارة السورية',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user456',
      'شكراً لكل من حضر البث المباشر اليوم ❤️ كان رائعاً!',
      ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800']
    );

    // Demo post 3
    this.createPost(
      'user789',
      'محمد المصري',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user789',
      'الموسيقى هي لغة العالم 🎵',
      []
    );

    // Add some demo likes and comments
    this.toggleLike('post_' + (Date.now() - 2000), 'user456');
    this.toggleLike('post_' + (Date.now() - 2000), 'user789');
  }
}

export const MomentsService = new MomentsServiceClass();
