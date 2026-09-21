import { useQuery } from "@tanstack/react-query";
import { getEvent, listEvents } from "@/api/events";
import { qk } from "@/lib/query-keys";

export function useEvents() {
  return useQuery({ queryKey: qk.events.all, queryFn: listEvents });
}

export function useEvent(slug: string | undefined) {
  return useQuery({
    queryKey: qk.events.detail(slug ?? ""),
    queryFn: () => getEvent(slug!),
    enabled: Boolean(slug),
  });
}
