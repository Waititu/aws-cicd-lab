import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/server.js";

describe("API", () => {
  it("returns a healthy status", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body).toEqual({
      status: "healthy"
    });
  });

  it("returns application version information", async () => {
    const response = await request(app)
      .get("/version")
      .expect(200);

    expect(response.body).toEqual({
      version: "local",
      environment: "test"
    });
  });
});
