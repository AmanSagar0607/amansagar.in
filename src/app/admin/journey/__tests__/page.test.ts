import { notFound } from "next/navigation";
import JourneyAdminPage from "../page";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("not found");
  }),
}));
jest.mock("@/components/journey/activity-editor", () => ({
  JourneyEditor: () => null,
}));

test("legacy editor is unavailable outside development", () => {
  expect(() => JourneyAdminPage()).toThrow("not found");
  expect(notFound).toHaveBeenCalled();
});
