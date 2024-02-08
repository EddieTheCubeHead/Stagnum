import React from "react";

const Sidebar = () => {
  return (
    <nav className="fixed flex flex-col  h-full px-12 py-16 w-80 top-0 z-10">
      <button className="fixed right-12 top-16">My Profile</button>
      <ul className="flex flex-col gap-4">
        <li>Home</li>
        <li>Search</li>
        <li>Create Pool</li>
        <li>Join Pool</li>
        <li>My Pool</li>
      </ul>
    </nav>
  );
};

export default Sidebar;
