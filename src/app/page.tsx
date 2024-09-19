"use client";

import Image from "next/image";

import {
  getVideoInfo,
  makeRecipe,
  Recipe,
  VideoInfo,
} from "@/actions/summarize-video";
import { useEffect, useState } from "react";

export default function Home() {
  const [videoURL, setVideoURL] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (videoURL === "") {
      setLoading(false);
      setError("No video URL provided");
    }
    getVideoInfo(videoURL!).then(setVideoInfo);
  }, [loading]);

  useEffect(() => {
    if (videoInfo == null) {
      return;
    }

    makeRecipe({
      description: videoInfo!.description,
      subtitles: videoInfo!.subtitles,
    }).then((r) => {
      setLoading(false);
      setRecipe(r);
    });
  }, [videoInfo]);

  const reset = () => {
    setLoading(false);
    setRecipe(null);
    setVideoInfo(null);
    setVideoURL("");
  };

  // const videoInfo = await getVideoInfo(
  //   "https://www.tiktok.com/@cookinginthemidwest/video/7412645278035070250"
  // );

  // const recipe = await makeRecipe({
  //   description: videoInfo.description,
  //   subtitles: videoInfo.subtitles,
  // });

  return (
    <div className="min-h-screen sm:p-20">
      <main
        id="main"
        className="flex flex-col row-start-2 items-center sm:items-start"
      >
        <div className="gap-4 dont-print">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Video URL
          </label>
          <input
            autoComplete="off"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="https://tiktok.com/..."
            onChange={(e) => setVideoURL(e.target.value)}
          />
          <button
            disabled={loading}
            type="button"
            className="my-2 rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-600 disabled:hover:bg-gray-500"
            onClick={() => setLoading(true)}
          >
            Get recipe
          </button>
        </div>
        {loading && (
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        )}
        {recipe !== null && (
          <div
            className="prose prose-h1:mb-4 prose-h2:my-2 prose-p:my-2"
            id="printarea"
          >
            <h1>{recipe.title}</h1>
            <p>
              {recipe.servings === 1 ? (
                <>1 serving</>
              ) : (
                <>{recipe.servings} servings</>
              )}{" "}
              -- by{" "}
              <a href={videoInfo!.uploader.url} className="underline">
                {"@"}
                {videoInfo!.uploader.id}
              </a>
            </p>
            {recipe.notes !== undefined && <p>{recipe.notes}</p>}
            <h2>Ingredients</h2>
            <ul>
              {recipe.ingredients.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <h2>Steps</h2>
            <ol>
              {recipe.steps.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ol>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center dont-print">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
