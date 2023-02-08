import { createSearchQuery } from "../createSearchQuery";
import type { Filters } from "../createSearchQuery";

describe("createSearchQuery", () => {
    test("full filters", () => {
        const filter: Filters = {
            involveMe: true,
            searchIn: ["title", "body", "comments"],
            login: "zpawn",
        };
        expect(createSearchQuery("bug", filter))
            .toEqual("bug is:issue involves:zpawn in:title,body,comments");
    });

    test("empty filters", () => {
        expect(createSearchQuery("bug"))
            .toEqual("bug is:issue");
    });

    test("involveMe true filters", () => {
        const filter = {
            involveMe: true,
            login: "zpawn",
        };
        expect(createSearchQuery("bug", filter)).toEqual("bug is:issue involves:zpawn");
    });

    test("involveMe false filters", () => {
        const filter = {
            involveMe: false,
            login: "zpawn",
        };
        expect(createSearchQuery("bug", filter)).toEqual("bug is:issue");
    });

    describe("searchIn filter", () => {
        test.each([
            [{ searchIn: ["all", "comments"] }, "bug is:issue"],
            [{ searchIn: ["title"] }, "bug is:issue in:title"],
            [{ searchIn: ["body"] }, "bug is:issue in:body"],
            [{ searchIn: ["comments"] }, "bug is:issue in:comments"],
            [{ searchIn: ["title", "body"] }, "bug is:issue in:title,body"],
            [{ searchIn: ["title", "comments"] }, "bug is:issue in:title,comments"],
            [{ searchIn: ["body", "comments"] }, "bug is:issue in:body,comments"],
        ])("%j", (filter, expected) => {
            expect(createSearchQuery("bug", filter as Filters)).toEqual(expected);
        });
    });
});
