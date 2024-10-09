import { dynamic } from "@/app/imports";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function BgVIdeo() {
  return (
    <div className="hidden absolute z-10 w-full h-screen overflow-hidden md:flex justify-center after:contents-[''] after:w-full after:h-screen after:absolute after:top-0 after:left-0 after:bg-linear">
      <ReactPlayer
        url="https://www.youtube.com/watch?v=ZWb6wCKA_Pk"
        loop
        muted
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,
            },
          },
        }}
        controls={false}
        width="100%"
        height="100%"
      />
    </div>
  );
}