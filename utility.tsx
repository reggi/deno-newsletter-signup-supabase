import { h, renderSSR } from 'nano-jsx'
import { createClient } from 'npm:@supabase/supabase-js'

type DatabaseOptions = { SUPABASE_URL: string, SUPABASE_ANON_KEY: string, SUPABASE_TABLE: string }
type Text = {title: string, button: string}
type Message = { successMessage: string, failureMessage: string}
type Options = Text & DatabaseOptions & Message

async function handleNewsletterSubmission(email: string, options: DatabaseOptions) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = options;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from(options.SUPABASE_TABLE)
    .insert([{ email }])
    .single();
  console.log({ data, error })
  if (error) {
    throw error;
  }
  return data;
}

function NewsletterSignup(props: Text) {
  return (
    <div class="p-5 m-auto w-4/12">
      <h2 class="text-lg font-bold mb-4">{ props.title } </h2>
      <form action="/submit" method="post" class="flex flex-col space-y-4">
        <input type="email" name="email" placeholder="Enter your email" class="p-2 border rounded" />
        <button type="submit" class="bg-indigo-600 text-white p-2 rounded">
          { props.button }          
        </button>
      </form>
    </div>
  );
}

const request = async (req: Request, options: Options) => {
  const { pathname } = new URL(req.url)
  if (req.method === "POST" && pathname === "/submit") {
    const formData = await req.formData()
    const email = formData.get("email")?.toString()
    if (email) {
      try {
        await handleNewsletterSubmission(email, options);
      } catch {
        return new Response(options.successMessage, { headers: { "Content-Type": "text/html" }})
      }
      return new Response(options.failureMessage, { headers: { "Content-Type": "text/html" }})
    } else {
      return new Response('Email is required', { status: 400 });
    }
  } else {
    const html = renderSSR(() => <NewsletterSignup {...options} />);
    return new Response(html, { headers: { "Content-Type": "text/html" }})
  }
}

const getOrThrow = (key: string) => {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`Missing ${key}`)
  }
  return value
}

export const requestNested = (props: Options) => (req: Request) => request(req, props)

export const envRequestNested = () => {
  return requestNested({ 
    SUPABASE_URL: getOrThrow("SUPABASE_URL"),
    SUPABASE_ANON_KEY: getOrThrow("SUPABASE_ANON_KEY"),
    SUPABASE_TABLE: getOrThrow("SUPABASE_TABLE"),
    successMessage: getOrThrow("successMessage"),
    failureMessage: getOrThrow("failureMessage"),
    title: getOrThrow("title"),
    button: getOrThrow("button")
  })
}