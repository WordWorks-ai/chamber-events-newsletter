import { z } from "zod";

import { getRuntimeDependencies } from "@/lib/server/runtime";
import { chamberSchema } from "@/lib/utils/validation";

export async function GET() {
  const runtime = getRuntimeDependencies();
  const chambers = await runtime.repository.listActiveChambers();
  return Response.json(z.array(chamberSchema).parse(chambers));
}
