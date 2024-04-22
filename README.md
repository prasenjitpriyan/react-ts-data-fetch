# Alternative: Using the "zod" Library for Response Data Validation

When fetching data, it can be a good idea to parse & validate the fetched data to check if it's in line with your data structure expectations.

A great library for doing that validation is the Zod library because this library embraces TypeScript and is written such that TypeScript is able to infer the structure of the parsed / validated data.

I could create an entire course about Zod, but here's a very brief introduction.

When working with Zod (after installing it via npm install zod), your main task is to create a schema for the data you're trying to validate.

For example, when fetching blog posts, you would define the schema for a single blog post:

```tsx
import { z } from "zod";

const rawDataBlogPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});
```

Important: This is JavaScript code! It will be compiled and will execute at runtime.

But, under the hood, it's written such that, during development, TypeScript is able to infer the type of the values that will be parsed / validated via that schema.

Speaking of that, here's how you would use this rawDataBlogPostSchema to validate a value:

```tsx
const parsedData = rawDataBlogPostSchema.parse(someData);
```

This will throw an error if someData is not in line with the defined schema (e.g., if a property is missing or of a different value type).

It will return the parsed data if validation succeeds.

The great thing is, that TypeScript now knows the type of parsedData => It will be the type you set up in your schema.

In this example, TypeScript would know that parsedData contains the properties id (number), userId (number), title (string) and body (string).

Therefore, even if someData was any or unknown, parsedData will be a known type.

When using Zod in the course demo app, you could therefore adjust the App component file like this:

```tsx
import { z } from "zod";
// other imports ...

// outside of App component function (since this doesn't need to be re-created all the time)
const rawDataBlogPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});
// z.array() is a Zod method that creates a new schema based on another schema
// as the name suggests, it's simply an array containing the expected objects
const expectedResponseDataSchema = z.array(rawDataBlogPostSchema);

function App() {
  // other code like useState() etc ...

  useEffect(() => {
    async function fetchPosts() {
      setIsFetching(true);
      try {
        const data = await get("https://jsonplaceholder.typicode.com/posts");
        const parsedData = expectedResponseDataSchema.parse(data);
        // No more type casting via "as" needed!
        // Instead, here, TypeScript "knows" that parsedData will be an array
        // full with objects as defined by the above schema
        const blogPosts: BlogPost[] = parsedData.map((rawPost) => {
          return {
            id: rawPost.id,
            title: rawPost.title,
            text: rawPost.body,
          };
        });
        setFetchedPosts(blogPosts);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
        // setError('Failed to fetch posts!');
      }

      setIsFetching(false);
    }

    fetchPosts();
  }, []);

  // other code ...
}
```

# Alternative: A Generic "get" Function

As always, there are, of course, multiple ways of building the get function.

You could, for example, also build it as a generic function that accepts the expected return value type as a type argument:

```tsx
export async function get<T>(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data.");
  }

  const data = (await response.json()) as unknown;
  return data as T;
}
```

Now the "Type Casting" ("Type Assertion") takes place right inside the get function to "force" TypeScript to treat data as type T.

T is then set when calling get:

```tsx
const data = await get<RawDataBlogPost[]>(
  "https://jsonplaceholder.typicode.com/posts"
);
```

This allows you to use get() without having to cast the type to the expected value type.

It's of course up to you, whether you prefer this approach whether the approach shown in the videos.

## Level-up: Use with Zod

You can also take this to the next level when using Zod (see previous lecture).

You can adjust the get function to accept a second parameter that could be called zodSchema and should be a Zod schema object (of type ZodType).

This Zod schema can then be used inside the get function to parse the received response.

```tsx
import { z } from "zod";

export async function get<T>(url: string, zodSchema: z.ZodType<T>) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data.");
  }

  const data = (await response.json()) as unknown;

  try {
    return zodSchema.parse(data);
  } catch (error) {
    throw new Error("Invalid data received from server.");
  }
}
```

Since Zod would throw an error if parsing the data fails, TypeScript knows that if it succeeds, the data will be a value of the type defined by the Zod schema (i.e., TypeScript will narrow the type to be of that type).

Therefore, no more type casting is needed anywhere. Instead, in the place where get() should be called, you just need to define a Zod schema that describes the expected type and pass it to get().

```tsx
import { z } from "zod";

const rawDataBlogPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});

const data = await get(
  "https://jsonplaceholder.typicode.com/posts",
  z.array(rawDataBlogPostSchema)
);

data[0].userId; // works => TypeScript knows that userId will exist on the returned data
```
