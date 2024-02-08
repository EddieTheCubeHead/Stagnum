import React from "react";

const PlaylistView = () => {
  return (
    <footer className="relative flex flex-col h-full ml-96">
      <div className="fixed text-white bottom-0 left-0 w-full py-4 px-12 flex z-10">
        <div className="flex gap-4 w-96">
          <a href="/about" className="text-white">
            About Stagnum
          </a>
          <a
            href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
            target="_blank"
            className="text-[#1ED760]"
          >
            Contact Us
          </a>
        </div>
        <p>Media Player</p>
      </div>
    </footer>
  );
};

export default PlaylistView;
