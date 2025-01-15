import path from 'path';
import { findUp, findUpSync } from 'find-up';
import { readPackage, readPackageSync } from 'read-pkg';
// TODO: Remove this once https://nodejs.org/api/esm.html#importmetaresolvespecifier is stable.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Options for resolving binary paths.
 */
interface ResolveBinOptions {
    /**
     * Optional executable name. Defaults to the package name if not provided.
     */
    executable?: string;
}

/**
 * Resolves the path to a module or its package.json file.
 * Falls back to resolving the module's directory if `package.json` cannot be found.
 *
 * @param name - The name of the module to resolve.
 * @returns The resolved path to the module or its directory.
 */
function requireResolve(name: string): string {
    try {
        return require.resolve(name);
    } catch {
        const modJson = require.resolve(`${name}/package.json`);
        return path.dirname(modJson);
    }
}

/**
 * Resolves the path to a binary file asynchronously.
 *
 * @param packageJsonPath - The path to the package.json file.
 * @param executable - The name of the executable to resolve.
 * @param name - The name of the module/package.
 * @returns A promise that resolves to the path of the binary file.
 */
async function resolveBinPath(
    packageJsonPath: string,
    executable: string,
    name: string
): Promise<string> {
    const pack = await readPackage({ cwd: path.dirname(packageJsonPath) });
    const binField = pack.bin;

    const binPath =
        typeof binField === 'object' ? binField[executable] : binField;
    if (!binPath) {
        throw new Error(`No bin '${executable}' in module '${name}'`);
    }

    return path.join(path.dirname(packageJsonPath), binPath);
}

/**
 * Resolves the path to a binary file synchronously.
 *
 * @param packageJsonPath - The path to the package.json file.
 * @param executable - The name of the executable to resolve.
 * @param name - The name of the module/package.
 * @returns The resolved path to the binary file.
 */
function resolveBinPathSync(
    packageJsonPath: string,
    executable: string,
    name: string
): string {
    const pack = readPackageSync({ cwd: path.dirname(packageJsonPath) });
    const binField = pack.bin;

    const binPath =
        typeof binField === 'object' ? binField[executable] : binField;
    if (!binPath) {
        throw new Error(`No bin '${executable}' in module '${name}'`);
    }

    return path.join(path.dirname(packageJsonPath), binPath);
}

// noinspection JSUnusedGlobalSymbols
/**
 * Resolves the path to a binary file asynchronously based on a package name.
 *
 * @param name - The name of the package to resolve.
 * @param opts - Optional configuration for the binary resolution.
 * @returns A promise that resolves to the path of the binary file.
 * @throws If the module or its package.json cannot be found.
 */
async function resolveBin(
    name: string,
    opts: ResolveBinOptions = {}
): Promise<string> {
    const executable = opts.executable ?? name;

    let modulePath: string;
    try {
        modulePath = requireResolve(name);
    } catch (err) {
        throw new Error(`Module '${name}' could not be resolved: ${err}`);
    }

    const packageJsonPath = await findUp('package.json', { cwd: modulePath });
    if (!packageJsonPath) {
        throw new Error(`Could not find package.json for module '${name}'`);
    }

    return resolveBinPath(packageJsonPath, executable, name);
}

// noinspection JSUnusedGlobalSymbols
/**
 * Resolves the path to a binary file synchronously based on a package name.
 *
 * @param name - The name of the package to resolve.
 * @param opts - Optional configuration for the binary resolution.
 * @returns The resolved path of the binary file.
 * @throws If the module or its package.json cannot be found.
 */
function resolveBinSync(name: string, opts: ResolveBinOptions = {}): string {
    const executable = opts.executable ?? name;

    const modulePath = requireResolve(name);
    const packageJsonPath = findUpSync('package.json', { cwd: modulePath });

    if (!packageJsonPath) {
        throw new Error(`Could not find package.json for module '${name}'`);
    }

    return resolveBinPathSync(packageJsonPath, executable, name);
}

export { resolveBin, resolveBinSync };
