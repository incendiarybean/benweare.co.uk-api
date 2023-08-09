import request from "supertest";
import { HTTPServer, app } from "../../src/server";

describe("Server should redirect to HTTPS when HTTP is used", () => {
    it("should redirect HTTP traffic with the correct status code (301)", async () => {
        const result = await request(app)
            .get("/")
            .set("x-forwarded-proto", "http://test.com");
        HTTPServer.close();
        expect(result.status).toBe(301);
    });

    it("should return a 403 if a forbidden request is made", async () => {
        const result = await request(app).post("/");
        HTTPServer.close();
        expect(result.status).toBe(403);
    });
});
