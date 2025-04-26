'use server';
/**
 * @fileOverview Generates a poem based on the content of an uploaded photo.
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
  tone: z.string().optional().describe('The tone of the poem, e.g., happy, sad, reflective.'),
  structure: z.string().optional().describe('The poetic structure, e.g., sonnet, haiku, free verse.'),
});
export type GeneratePoemInput = z.infer<typeof GeneratePoemInputSchema>;

const GeneratePoemOutputSchema = z.object({
  title: z.string().describe('The title of the poem.'),
  poem: z.string().describe('The generated poem.'),
});
export type GeneratePoemOutput = z.infer<typeof GeneratePoemOutputSchema>;

export async function generatePoem(input: GeneratePoemInput): Promise<GeneratePoemOutput> {
  return generatePoemFlow(input);
}

const decidePoemToneAndStructure = ai.defineTool({
  name: 'decidePoemToneAndStructure',
  description: 'Decides the tone and poetic structure for a poem based on the image content.',
  inputSchema: z.object({
    photoDataUri: z
      .string()
      .describe(
        "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  }),
  outputSchema: z.object({
    tone: z.string().describe('The tone of the poem, e.g., happy, sad, reflective.'),
    structure: z.string().describe('The poetic structure, e.g., sonnet, haiku, free verse.'),
  }),
},
async input => {
    // This is a placeholder implementation.
    // In a real application, this would use an LLM or other AI to analyze the image
    // and determine an appropriate tone and structure.
    return {
      tone: 'reflective',
      structure: 'free verse',
    };
  }
);

const poemPrompt = ai.definePrompt({
  name: 'poemPrompt',
  tools: [decidePoemToneAndStructure],
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      tone: z.string().describe('The tone of the poem.'),
      structure: z.string().describe('The poetic structure.'),
    }),
  },
  output: {
    schema: z.object({
      title: z.string().describe('The title of the poem.'),
      poem: z.string().describe('The generated poem.'),
    }),
  },
  prompt: `You are a creative poet. Generate a poem based on the content of the photo.

  The poem should have a {{{tone}}} tone and follow a {{{structure}}} structure.

  Here is the photo: {{media url=photoDataUri}}

  Make sure to add a title to the poem.
  `,
});

const generatePoemFlow = ai.defineFlow<
  typeof GeneratePoemInputSchema,
  typeof GeneratePoemOutputSchema
>({
  name: 'generatePoemFlow',
  inputSchema: GeneratePoemInputSchema,
  outputSchema: GeneratePoemOutputSchema,
}, async input => {
  const { tone, structure } = input.tone && input.structure ? {
    tone: input.tone,
    structure: input.structure
  } : (await decidePoemToneAndStructure({
    photoDataUri: input.photoDataUri,
  }));

  const { output } = await poemPrompt({
    photoDataUri: input.photoDataUri,
    tone: tone,
    structure: structure,
  });
  return output!;
});

