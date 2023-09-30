import { envRequestNested } from "./utility.tsx";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

Deno.serve(envRequestNested())