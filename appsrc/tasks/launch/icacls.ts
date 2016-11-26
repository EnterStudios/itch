
import spawn from "../../util/spawn";
import mklog, {Logger} from "../../util/log";
const log = mklog("icacls");

interface IIcaclsOptions {
  path: string;
  sid: string;
  logger: Logger;
}

async function icacls (opts: IIcaclsOptions, reason: string, args: string[]) {
  const removeRes = await spawn.getOutput({
    command: "icacls",
    args,
    onToken:    (tok) => { log(opts, `[${reason} out] ${tok}`); },
    onErrToken: (tok) => { log(opts, `[${reason} err] ${tok}`); },
  });
  log(opts, `acl cleanup output:\n${removeRes}`);
}

async function removeGrants(opts: IIcaclsOptions, reason: string) {
  await icacls(opts, reason, [
    opts.path,
    "/remove:d", // remove any deny (:d) ACL entries for sid
    opts.sid,
    "/T", // apply recursively
    "/Q", // don't print success messages, only errors
    "/c", // continue on error
  ]);
}

export async function shareWith(opts: IIcaclsOptions) {
  // acl cleanup is needed because previous instances of the win32 sandbox
  // would deny all access to all files recursively (and individually) after
  // the sandbox ran, instead of removing ACL entries
  await removeGrants(opts, "cleanup");

  // We only need to grant access to the folder, thanks to inheritance:
  //   F = full access (list, read, write, create, etc.)
  //   (OI) = object inheritance (applies to all files)
  //   (CI) = container inheritance (applies to all subfolders)
  // Note: we don't need "/T", since inheritance recursive by default,
  // as long as we don't specify (NP)
  const perm = "(OI)(CI)F";

  await icacls(opts, "grant", [
    opts.path,
    "/grant",
    `${opts.sid}:${perm}`,
    "/Q", // don't print success messages, only errors
  ]);
}

export async function unshareWith(opts: IIcaclsOptions) {
   // this undoes both what the old sandbox (change permission of all files) did
   // and what the new sandbox does (inherited grant on root folder)
   await removeGrants(opts, "unshare");
}
