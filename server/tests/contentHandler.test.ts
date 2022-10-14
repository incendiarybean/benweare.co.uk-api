import request from "supertest";
import { HTTPServer, app } from "..";

describe("Server should server static content.", () => {
    test("Api Docs are served.", async () => {
        const result = await request(app)
            .get("/api/docs")
            .set("x-forwarded-proto", "http://test.com");
        HTTPServer.close();
        expect(result.status).toBe(301);
    });
});
