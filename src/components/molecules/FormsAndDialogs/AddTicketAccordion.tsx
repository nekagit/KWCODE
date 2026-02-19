/** Add Ticket Accordion component. */
import { Accordion } from "@/components/shared/Accordion";
import { TicketFormFields } from "@/components/atoms/forms/TicketFormFields";
import type { TicketStatus } from "@/types/ticket";

interface AddTicketAccordionProps {
  ticketForm: { title: string; description: string; status: TicketStatus; priority: number; };
  setTicketForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; status: TicketStatus; priority: number; }>>;
  addTicket: () => Promise<void>;
}

export function AddTicketAccordion({
  ticketForm,
  setTicketForm,
  addTicket,
}: AddTicketAccordionProps) {
  return (
    <Accordion
      items={[
        {
          title: "Add ticket",
          children: (
            <TicketFormFields
              ticketForm={ticketForm}
              setTicketForm={setTicketForm}
              addTicket={addTicket}
            />
          ),
        },
      ]}
    />
  );
}
