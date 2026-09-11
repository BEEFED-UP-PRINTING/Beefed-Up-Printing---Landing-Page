import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Tell us more details (min 10 chars)"),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Simulated hook for the contact form since there is no backend endpoint
export function useSubmitContact() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: ContactInput) => {
      // Simulate network latency for effect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "QUOTE REQUESTED",
        description: "We got your details. We'll hit you back soon.",
        style: {
          backgroundColor: "hsl(0 0% 7%)",
          color: "hsl(0 0% 98%)",
          border: "1px solid hsl(24 95% 53%)", // Neon orange border
        }
      });
    },
    onError: () => {
      toast({
        title: "ERROR",
        description: "Something went wrong. Try hitting us up on socials.",
        variant: "destructive",
      });
    },
  });
}
