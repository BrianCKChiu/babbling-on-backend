import { GestureMedia } from "@prisma/client";
import prisma from "../database/prisma";

/**
 *
 * @param {string} gestureId id of the gesture
 * @return {Promise<GestureMedia>} the first gesture Media object found in prisma
 */
export async function getGestureMediaRef(
  gestureId: string
): Promise<GestureMedia> {
  return prisma.gestureMedia.findFirst({
    where: { gestureId: gestureId },
  });
}
