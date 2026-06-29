// cSpell:words preapexis
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type AskUserParams = {
  question: string;
  options: string[];
  allowCustom?: boolean;
};

const CUSTOM_OPTION = "✍ Write something else";

export default function (pi: ExtensionAPI): void {
  pi.registerTool({
    name: "ask_user",
    label: "Ask User",
    description:
      "Ask the user a multiple-choice question and wait for their answer before continuing.",
    promptSnippet:
      "Ask the user a multiple-choice question when clarification is required.",
    promptGuidelines: [
      "Use ask_user when you need clarification before continuing.",
      "Use ask_user instead of guessing when multiple reasonable choices exist.",
      "Use ask_user with short, clear options.",
      "Do not ask open-ended clarification questions directly in chat when ask_user can be used.",
      "Always include useful default options. The ask_user tool automatically adds a custom-answer option."
    ],
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question to ask the user."
        },
        options: {
          type: "array",
          items: { type: "string" },
          description:
            "Short answer choices. Do not include 'Write something else'; it is added automatically."
        },
        allowCustom: {
          type: "boolean",
          description:
            "Whether the user can write a custom answer. Defaults to true."
        }
      },
      required: ["question", "options"]
    } as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const input = params as AskUserParams;

      if (!ctx.hasUI) {
        return {
          content: [
            {
              type: "text",
              text: [
                "Cannot ask the user with options because Pi UI is not available.",
                "",
                `Question: ${input.question}`,
                "",
                "Options:",
                ...input.options.map(
                  (option, index) => `${index + 1}. ${option}`
                )
              ].join("\n")
            }
          ],
          details: {
            answered: false,
            reason: "missing_ui"
          }
        };
      }

      const cleanOptions = input.options
        .map((option) => option.trim())
        .filter(Boolean);

      const allowCustom = input.allowCustom !== false;

      const choices = allowCustom
        ? [...cleanOptions, CUSTOM_OPTION]
        : cleanOptions;

      if (choices.length === 0) {
        const answer = await ctx.ui.input("Question", input.question);

        return {
          content: [
            {
              type: "text",
              text: `User answered: ${answer}`
            }
          ],
          details: {
            answered: true,
            answer,
            custom: true
          }
        };
      }

      const choice = await ctx.ui.select(input.question, choices);

      if (!choice) {
        return {
          content: [
            {
              type: "text",
              text: "User cancelled the question. Stop and ask again only if the answer is required."
            }
          ],
          details: {
            answered: false,
            cancelled: true
          }
        };
      }

      if (choice === CUSTOM_OPTION) {
        const answer = await ctx.ui.input(
          "Write something else",
          input.question
        );

        return {
          content: [
            {
              type: "text",
              text: `User answered: ${answer}`
            }
          ],
          details: {
            answered: true,
            answer,
            custom: true
          }
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `User selected: ${choice}`
          }
        ],
        details: {
          answered: true,
          answer: choice,
          custom: false
        }
      };
    }
  });


}
