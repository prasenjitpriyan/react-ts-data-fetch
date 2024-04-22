export type BlogPost = {
  id: string;
  title: string;
  text: string;
};

type BlogPostsProps = {
  posts: BlogPost[];
};

export default function BlogPosts({ posts }: BlogPostsProps) {
  return (
    <div className="w-[90%] bg-purple-200 p-4 flex flex-col items-center">
      <h1>Blog Posts</h1>
      <ul className="w-[90%] grid grid-cols-2 bg-purple-300 p-4 gap-5">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-col justify-center items-center"
          >
            <h2>{post.title}</h2>
            <p>{post.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
