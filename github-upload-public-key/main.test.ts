import { describe, expect, it } from "bun:test";
import { createJSONResponse, execContainer, findResourceInstance, runContainer, runTerraformApply, runTerraformInit, testRequiredVariables, writeCoder } from "../test";
import { Server, serve } from "bun";

describe("github-upload-public-key", async () => {
  await runTerraformInit(import.meta.dir);

  testRequiredVariables(import.meta.dir, {
    agent_id: "foo",
  });

  it("creates new key if one does not exist", async () => {
    const { instance, id } = await setupContainer();
    await writeCoder(id, "echo foo");
    let exec = await execContainer(id, ["bash", "-c", instance.script]);
    expect(exec.stdout).toContain("Coder public SSH key uploaded to GitHub!")
    expect(exec.exitCode).toBe(0);
  });

  it("does nothing if one already exists", async () => {
    const { instance, id } = await setupContainer();
    await writeCoder(id, "echo findkey");
    let exec = await execContainer(id, ["bash", "-c", instance.script]);
    expect(exec.stdout).toContain("Coder public SSH key is already uploaded to GitHub!")
    expect(exec.exitCode).toBe(0);
  });
});

const setupContainer = async (
    image = "lorello/alpine-bash",
    vars: Record<string, string> = {},
  ) => {
    const server = await setupServer();
    const state = await runTerraformApply(import.meta.dir, {
      agent_id: "foo",
      // trim the trailing slash on the URL
      access_url: server.url.toString().slice(0, -1),
      owner_session_token: "bar",
      github_api_url: server.url.toString().slice(0, -1),
      ...vars,
    });
    const instance = findResourceInstance(state, "coder_script");
    const id = await runContainer(image);
    return { id, instance };
};

const setupServer = async (): Promise<Server> => {
    let url: URL;
    const fakeSlackHost = serve({
      fetch: (req) => {
        url = new URL(req.url);
        if (url.pathname === "/api/v2/users/me/gitsshkey") {
            return createJSONResponse({
                public_key: "exists",
              });
        }

        if (url.pathname === "/user/keys") {
            if (req.method === "POST") {
                return createJSONResponse({
                    key: "created",
                }, 201);
            }

            // case: key already exists
            if (req.headers.get("Authorization") == "Bearer findkey") {
                return createJSONResponse([{
                    key: "foo",
                }, {
                    key: "exists",
                }]);
            }

            // case: key does not exist
            return createJSONResponse([{
                key: "foo",
            }]);
        }


        return createJSONResponse({
            error: "not_found"
        }, 404);
      },
      port: 0,
    });

    return fakeSlackHost;
}