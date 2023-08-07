import request from "supertest";
import { HTTPServer, app } from "../../src/server";

describe("Server should redirect to HTTPS when HTTP is used", () => {
    test("Status code matches the redirect", async () => {
        const result = await request(app)
            .get("/")
            .set("x-forwarded-proto", "http://test.com");
        HTTPServer.close();
        expect(result.status).toBe(301);
    });

    test("Status code matches the redirect", async () => {
        const result = await request(app).post("/");
        HTTPServer.close();
        expect(result.status).toBe(403);
    });
});
