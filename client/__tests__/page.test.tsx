import { render, screen } from "@testing-library/react";
import React from "react";
import Page from "../app/page";

describe("Page", () => {
  it("renders a About Stagnum section", () => {
    render(<Page />);

    const heading = screen.getByText("Contact Us");

    expect(heading).toBeInTheDocument();
  });
});
