"use strict";

const path = require("path");

const AV = require("leanengine");
const Koa = require("koa");
const Router = require("koa-router");
const views = require("koa-views");
const statics = require("koa-static");
const bodyParser = require("koa-bodyparser");

// Loads cloud function definitions.
// You can split it into multiple files but do not forget to load them in the main file.
require("./cloud");

const app = new Koa();

// Configures template engine.
app.use(views(path.join(__dirname, "views")));

// Configures static resources directory.
app.use(statics(path.join(__dirname, "public")));

const router = new Router();
app.use(router.routes());

// Loads LeanEngine middleware.
app.use(AV.koa());

app.use(bodyParser());

const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
router.get("/ip/:ip", async function (ctx) {
  const IP = ctx.params["ip"];
  const { stdout, stderr } = await exec(`npx nali ${IP}`);
  ctx.response.body = stdout || stderr;
});
router.get("/character", async function (ctx) {
  const character = await (
    await fetch(
      `https://www.xd.com/users/getUserCharacter${ctx.search.replace(
        "id=XD.",
        "id="
      )}`
    )
  ).json();
  const { pid, name, ...rest } = character?.data?.[0] ?? {};
  ctx.response.body = JSON.stringify(
    { 角色名: name, "角色 ID": pid, ...rest },
    undefined,
    2
  );
  ctx.response.type = "json";
});

module.exports = app;
