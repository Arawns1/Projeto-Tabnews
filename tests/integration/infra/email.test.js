import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "TabNews <contato@tabnews.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de assunto",
    });
    await email.send({
      from: "TabNews <contato@tabnews.com.br>",
      to: "contato@curso.dev",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email",
    });
    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail).toBeDefined();
    expect(lastEmail.sender).toBe("<contato@tabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do ultimo email\n");
  });
});
