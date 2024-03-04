/* eslint-disable testing-library/prefer-screen-queries */
import { render, screen } from "@testing-library/react";
import React from "react";
import About from "../app/about/page";
import '@testing-library/jest-dom'


describe("Page", () => {
  it("Render starts with load", () => {
    const { getByText } = render(<About />);
    const specificText = getByText('About Stagnum');
    expect(specificText).toBeInTheDocument();
  });
});
