import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders MIA Logistics app", () => {
  render(<App />);
  const brandElement = screen.getByText("MIA Logistics", {
    selector: ".brand-text",
  });
  expect(brandElement).toBeInTheDocument();
});
