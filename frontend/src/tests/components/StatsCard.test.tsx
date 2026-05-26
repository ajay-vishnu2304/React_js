import { render, screen } from "@testing-library/react";
import StatsCard from "../../components/StatsCard/StatsCard";
import "@testing-library/jest-dom";

describe("StatsCard Component", () => {
  test("renders title, value, percentage and select options", () => {
    render(<StatsCard title="Total Sales" value="$12,345" percentage="+15%" />);

    expect(screen.getByText("Total Sales")).toBeInTheDocument();
    expect(screen.getByText("$12,345")).toBeInTheDocument();
    expect(screen.getByText("+15%")).toBeInTheDocument();

    // select with default options
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Year" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Month" })).toBeInTheDocument();
  });
});
