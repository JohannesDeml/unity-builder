import { getExecOutput, ExecOptions } from '@actions/exec';

export async function execWithErrorCheck(
  commandLine: string,
  arguments_?: string[],
  options?: ExecOptions,
  errorWhenMissingUnityBuildResults: boolean = true,
): Promise<number> {
  const result = await getExecOutput(commandLine, arguments_, options);

  if (!errorWhenMissingUnityBuildResults) {
    return result.exitCode;
  }

  // Check for errors in the Build Results section
  const match = result.stdout.match(/^#\s*Build results\s*#(.*)^Size:/ms);

  if (match) {
    const buildResults = match[1];
    const errorMatch = buildResults.match(/^Errors:\s*(\d+)$/m);
    if (errorMatch && Number.parseInt(errorMatch[1], 10) !== 0) {
      throw new Error(`There was an error building the project. Please read the logs for details.`);
    }
  } else {
    throw new Error(
      `Could not find build results section in the logs. There was either a build error or the results were not logged from the script.`,
    );
  }

  return result.exitCode;
}
