"use server";

import OpenAI from "openai";
import { readFile } from "fs/promises";
import { z } from "zod";
import { $ } from "execa";
import { YtDlp, YtDlpConfig } from "@yemreak/yt-dlp";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_TOKEN,
  defaultHeaders: {
    "X-Title": "Cooktok", // Optional. Shows in rankings on openrouter.ai.
  }
});

const model = process.env.OPENAI_MODEL || "google/gemini-flash-8b-1.5-exp";

const recipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  servings: z.number().int(),
  steps: z.array(z.string()),
  notes: z.string().optional()
}).strict();

export interface Recipe {
  title: string;
  ingredients: string[];
  servings: number;
  steps: string[];
  notes?: string;
}

const defaultConversation = [
  {
    role: "system",
    content: `You are a helpful assistant that answers in JSON. Here's the json schema you must adhere to:
<schema>
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "ingredients": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "servings": {
      "type": "integer"
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "title",
    "ingredients",
    "servings",
    "steps"
  ]
}
</schema>`},
  {
    role: "user",
    content: `One Pan Marry Me Chicken Orzo Nutrition facts per serving (makes 4): 494 calories 37g protein 18g fat 46g carbs 5g fiber Ingredients: 16oz chicken breast 3 cups chicken broth (sodium free) 1/2 cup parmesan cheese 1 cup sun dried tomatoes (drained) 8oz orzo 2 cup spinach  1 cup almond milk  1 tbsp olive oil 2 garlic cloves crushed red pepper onion powder garlic powder paprika Italian seasoning black pepper and salt (To preference) Notes: *When your cooking the orzo make sure to remove the cover every couple of minutes to stir and ensure nothing sticks to the bottom of the pan *Add equal portions to meal prep containers *Recipe makes 4 servings; you can double the recipe and make even more If you want to learn more about your calorie & macro goals for weight loss and how to use these goals to eat in a balanced way that fits YOUR lifestyle, link in bio to apply for 1:1 weight loss coaching. Enjoy! #meal #mealprep #mealideas #mealprepideas #diettips #nutritiontips #food #diet #nutrition #dietitian
  
WEBVTT


00:00:00.000 --> 00:00:00.760
I'm a dietitian,

00:00:00.761 --> 00:00:03.681
and if you're trying to lose weight but still want to enjoy your food,

00:00:03.682 --> 00:00:05.641
you have to try this delicious one pan.

00:00:05.642 --> 00:00:06.841
Marry me Chicken Orzo.

00:00:06.842 --> 00:00:11.241
Each serving comes out to 494 calories and 37 grams of protein,

00:00:11.242 --> 00:00:12.921
and it's a quick and easy meal idea

00:00:12.922 --> 00:00:14.161
that you can prep for the week ahead.

00:00:14.162 --> 00:00:15.161
Let me show you how to make it.

00:00:15.400 --> 00:00:18.840
you wanna dice up 16 ounces of chicken breast and set it to the side.

00:00:18.841 --> 00:00:19.841
Then in a large pan,

00:00:19.842 --> 00:00:22.121
add a tablespoon of olive oil and minced garlic.

00:00:22.122 --> 00:00:25.001
Let the garlic cook and then add diced chicken to the pan.

00:00:25.002 --> 00:00:27.001
Once the chicken is completely cooked through,

00:00:27.002 --> 00:00:30.161
add 1 cup of drained sun dried tomatoes, paprika,

00:00:30.162 --> 00:00:30.961
garlic powder,

00:00:30.962 --> 00:00:32.921
onion powder, Italian seasonings,

00:00:32.922 --> 00:00:33.881
crushed red pepper,

00:00:33.882 --> 00:00:36.641
a dash of salt and some pepper and mix it all together.

00:00:36.642 --> 00:00:37.121
Let it cook

00:00:37.122 --> 00:00:41.241
and then add 8 ounces of orzo and 3 cups of sodium free chicken broth.

00:00:41.242 --> 00:00:42.561
Stir it in and cover the pan.

00:00:42.562 --> 00:00:44.761
Let it cook on medium heat for 12 minutes.

00:00:44.762 --> 00:00:46.281
Once the orzo is cooked through,

00:00:46.282 --> 00:00:49.561
add one cup of almond milk and a half a cup of Parmesan cheese

00:00:49.562 --> 00:00:50.321
and stir it in.

00:00:50.322 --> 00:00:52.721
And then finally add two cups of fresh spinach.

00:00:52.722 --> 00:00:55.401
Stir for another minute until the spinach is wilted down

00:00:55.402 --> 00:00:56.601
and then remove it from the heat.

00:00:56.602 --> 00:00:59.441
Make sure to read the caption for detailed meal prep instructions.

00:00:59.442 --> 00:01:03.322
And don't forget to like and follow for new recipes and Enjoy`},
  {
    role: "assistant",
    content: `{
  "title": "One Pan Marry Me Chicken Orzo",
  "ingredients": ["16oz chicken breast", "3 cups chicken broth (sodium free)", "1/2 cup parmesan cheese", "1 cup sun dried tomatoes (drained)", "8oz orzo", "2 cup spinach", "1 cup almond milk", "1 tbsp olive oil", "2 garlic cloves", "crushed red pepper to taste", "onion powder to taste", "garlic powder to taste", "paprika to taste", "Italian seasoning to taste", "black pepper to taste", "salt to taste"],
  "servings": 4
  "steps": [
    "Dice 16 ounces of chicken breast",
    "Mince garlic",
    "Heat pan to medium-high",
    "Add one tablespoon of olive oil and minced garlic",
    "Let the garlic cook until fragrant and add diced chicken",
    "Once chicken is cooked through (no pink remains), add 1 cup of drained sun dried tomatoes and the paprika, garlic powder, onion powder, Italian seasonings, crushed red pepper, a dash of salt and a teaspoon of pepper and mix it all together",
    "Let it cook and add 8 ounces of orzo and 3 cups of sodium free chicken broth, stir and cover the pan",
    "Let it cook on medium heat for 12 minutes",
    "Once the orzo is cooked through, add one cup of almond milk and half a cup of Parmesan cheese and stir it in",
    "Finally add two cups of fresh spinach",
    "Stir until it wilts and remove from heat",
    "Serve and enjoy"
  ],
  "notes": "exact amounts of spices will vary on personal preference. You can always add more, but you can't add less."
}`
  }
];

export interface MakeRecipeParams {
  description: string,
  subtitles: string,
};

export const makeRecipe = async ({ description, subtitles }: MakeRecipeParams): Promise<Recipe> => {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL!,
    messages: defaultConversation.concat([
      { role: "user", content: `${description}\n\n${subtitles}` }
    ]) as OpenAI.ChatCompletionMessage[],
  });

  const result = JSON.parse(completion.choices[0].message.content!);
  return recipeSchema.parse(result);
};

export interface VideoInfo {
  url: string;
  uploader: {
    name: string;
    id: string;
    url: string;
  };
  thumbnail_url: string;
  description: string;
  subtitles: string;
};

export const getVideoInfo = async (videoURL: string): Promise<VideoInfo> => {
  const config: YtDlpConfig = { workdir: "./var" }
  const ytDlp = new YtDlp(config);
  await ytDlp.downloadLatestReleaseIfNotExists();

  const mediaInfo = await ytDlp.retrieveMediaInfoList(videoURL);
  if (mediaInfo.length === 0) {
    throw new Error(`wrong length of metadata information: ${mediaInfo.length}`);
  }
  const info = mediaInfo[0];

  await $`yt-dlp -o ./var/%(id)s.%(ext)s --write-thumbnail --write-subs ${videoURL}`;

  const subtitleText = (await readFile(`./var/${info.id}.eng-US.vtt`)).toString();

  return {
    url: videoURL,
    uploader: {
      name: info.channel,
      id: info.uploader,
      url: info.channel_url,
    },
    thumbnail_url: info.thumbnail,
    description: info.description.replaceAll("  ", "\n"),
    subtitles: subtitleText,
  };
};