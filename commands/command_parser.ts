type CommandType =
    "test" | "play";

export type TestCommand = {
    type: "test",
};

export type PlayCommand = {
    type: "play",
    query: string,
};

export type Command = 
    TestCommand | PlayCommand;

export const createCommandParser = (prefix: string) => {
    return (message: {content: string}): Command | undefined => {
        if(!message.content.startsWith(prefix)) {
            return;
        }

        const commandAndParams = message.content.split(" ");
        const command = commandAndParams.slice(0, 1)[0].substring(prefix.length); // trim prefix
        const params = commandAndParams.slice(1);

        switch(command) {
            case "test":
                return {
                    type: "test"
                };
            case "p":
            case "play":
                return {
                    type: "play",
                    query: params.join(" "),
                };
        }
    };
};
