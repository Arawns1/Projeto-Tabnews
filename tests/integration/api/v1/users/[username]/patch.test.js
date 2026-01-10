import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "UsuarioInexistente",
          }),
        },
      );
      expect(response.status).toBe(404);
      const responseBody2 = await response.json();

      expect(responseBody2).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@curso.dev",
          password: "senha123",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@curso.dev",
          password: "senha123",
        }),
      });
      expect(user2Response.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );

      expect(response3.status).toBe(400);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user32",
          email: "user32@curso.dev",
          password: "senha123",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user12",
          email: "user12@curso.dev",
          password: "senha123",
        }),
      });
      expect(user2Response.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user12@curso.dev",
          }),
        },
      );

      expect(response3.status).toBe(400);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@curso.dev",
          password: "senha123",
        }),
      });
      expect(user1Response.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response3.status).toBe(200);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        id: response3Body.id,
        username: "uniqueUser2",
        email: "uniqueUser1@curso.dev",
        password: response3Body.password,
        created_at: response3Body.created_at,
        updated_at: response3Body.updated_at,
      });

      expect(uuidVersion(response3Body.id)).toBe(4);
      expect(Date.parse(response3Body.created_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).toBeGreaterThan(
        Date.parse(response3Body.created_at),
      );
    });

    test("With unique 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueEmail1@curso.dev",
          password: "senha123",
        }),
      });
      expect(user1Response.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@curso.dev",
          }),
        },
      );

      expect(response3.status).toBe(200);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        id: response3Body.id,
        username: "uniqueEmail1",
        email: "uniqueEmail2@curso.dev",
        password: response3Body.password,
        created_at: response3Body.created_at,
        updated_at: response3Body.updated_at,
      });

      expect(uuidVersion(response3Body.id)).toBe(4);
      expect(Date.parse(response3Body.created_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).toBeGreaterThan(
        Date.parse(response3Body.created_at),
      );
    });

    test("With new password", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword1",
          email: "newPassword1@curso.dev",
          password: "newPassword1",
        }),
      });
      expect(user1Response.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/newPassword1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response3.status).toBe(200);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        id: response3Body.id,
        username: "newPassword1",
        email: "newPassword1@curso.dev",
        password: response3Body.password,
        created_at: response3Body.created_at,
        updated_at: response3Body.updated_at,
      });

      expect(uuidVersion(response3Body.id)).toBe(4);
      expect(Date.parse(response3Body.created_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).not.toBeNaN();
      expect(Date.parse(response3Body.updated_at)).toBeGreaterThan(
        Date.parse(response3Body.created_at),
      );

      const userInDatabase = await user.findOneByUsername("newPassword1");
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
