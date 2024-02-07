import { render, screen } from "@testing-library/react";
import React from "react";
import Page from "../app/page";

describe("Page", () => {
  it("renders homepage unchanged", () => {
    const { container } = render(<Page />);
    expect(container).toMatchSnapshot();
  });
});
