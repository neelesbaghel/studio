'use server';
/**
 * @fileOverview Generates a poem based on the content of an uploaded photo,
 * allowing specification of tone and language.
 *
 * - generatePoem - A function that generates a poem from a photo.
 * - GeneratePoemInput - The input type for the generatePoem function.
 * - GeneratePoemOutput - The return type for the generatePoem function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePoemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tone: z.string().optional().describe('The desired tone of the poem, e.g., happy, sad, reflective. If omitted, the AI will choose.'),
  language: z.string().optional().default('English').describe('The desired language of the poem. Defaults to English.'),
});
export type GeneratePoemInput = z.infer<typeof GeneratePoemInputSchema>;

const GeneratePoemOutputSchema = z.object({
  title: z.string().describe('The title of the poem in the specified language.'),
  poem: z.string().describe('The generated poem in the specified language.'),
});
export type GeneratePoemOutput = z.infer<typeof GeneratePoemOutputSchema>;

export async function generatePoem(input: GeneratePoemInput): Promise<GeneratePoemOutput> {
  // Input validation ensures language has a default.
  // We pass the validated input directly to the flow.
  return generatePoemFlow(input);
}


const poemPrompt = ai.definePrompt({
  name: 'poemPrompt',
  // Removed the decidePoemToneAndStructure tool
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      tone: z.string().optional().describe('The desired tone for the poem. If omitted, choose an appropriate one.'),
      language: z.string().describe('The language for the poem.'),
    }),
  },
  output: {
    schema: GeneratePoemOutputSchema, // Use the existing output schema
  },
  prompt: `You are a creative multilingual poet. Generate a poem inspired by the provided photo.

The poem must be written in {{language}}.

{{#if tone}}
The poem should have a {{{tone}}} tone.
{{else}}
Choose an appropriate tone based on the image content (e.g., reflective, joyful, melancholic, mysterious).
{{/if}}

Here is the photo: {{media url=photoDataUri}}

Generate a suitable title for the poem, also in {{language}}.
Your output must be in the specified JSON format, containing the title and the poem.
`,
});

const generatePoemFlow = ai.defineFlow<
  typeof GeneratePoemInputSchema,
  typeof GeneratePoemOutputSchema
>({
  name: 'generatePoemFlow',
  inputSchema: GeneratePoemInputSchema,
  outputSchema: GeneratePoemOutputSchema,
}, async (input) => {
  // Directly call the prompt with the validated input.
  // 'language' has a default from the schema, 'tone' is optional.
  const { output } = await poemPrompt({
    photoDataUri: input.photoDataUri,
    tone: input.tone, // Pass tone (or undefined if not provided)
    language: input.language!, // Pass language (guaranteed to exist due to default)
  });

  if (!output) {
    throw new Error("Poem generation failed to produce output.");
  }
  return output;
});
