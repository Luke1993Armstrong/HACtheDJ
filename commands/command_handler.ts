import { Command } from "./command_parser";

export const createCommandHandler = ({
    runTestCommand,
    runPlayCommand,
}: {
    runTestCommand: () => void,
    runPlayCommand: (query: string) => void,
}) => {
    return (command: Command) => {
        switch(command.type) {
            case "test":
                return runTestCommand();
            case "play":
                return runPlayCommand(command.query);
        }
    };
};