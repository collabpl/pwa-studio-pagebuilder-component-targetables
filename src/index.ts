import path from "path";
import globby = require("globby");
import {stat as fsStat} from "fs/promises";
import {requireTargetFile} from "./requireTargetFile.js";

enum LogLevel {
    None = -1,
    Warn = 0,
    Debug = 2,
}

type ExtendInterceptOptions = {
    logLevel: LogLevel;
};

class ExtendPagebuilderComponentIntercept {
    private targetables: any;

    private componentsCache: Record<string, any> = {};

    private readonly logLevel: LogLevel;

    constructor(
        targetables: any,
        options: ExtendInterceptOptions = { logLevel: LogLevel.None },
    ) {
        this.targetables = targetables;
        this.logLevel = options.logLevel;
    }

    /**
     * @param fileExtension
     * @param targetablesSearchPaths
     * @param magentoPath
     */
    public allowCustomTargetables = async (
        fileExtension = '*.targetables.js',
        targetablesSearchPaths = ['src/pagebuilder'],
        magentoPath = 'node_modules/@magento',
    ) => {
        const currentPath = process.cwd();
        const paths = await ExtendPagebuilderComponentIntercept.getPathsByFileExtension(
            fileExtension,
            targetablesSearchPaths,
        );

        const replaceRegex = this.buildRegex(targetablesSearchPaths);

        const pathReplacement = fileExtension.substring(
            1,
            fileExtension.length - 3,
        );

        const callBack = (file: string) => file
            .replace(pathReplacement, '')
            .replace(replaceRegex, `${magentoPath}/pagebuilder/lib/ContentTypes/`);

        const compListMap = await this.resolveCoreFiles(paths, callBack);
        compListMap.forEach((props) => {
            const { relativePath, myPath } = props;
            const component = this.getReactComponent(
                relativePath.replace('node_modules/', ''),
            );

            this.log(
                LogLevel.Debug,
                'Intercept',
                `${currentPath}/${myPath}`,
            );

            const componentInterceptor = requireTargetFile(
                `${currentPath}/${myPath}`,
            );

            if (
                componentInterceptor
                && componentInterceptor.interceptComponent
            ) {
                componentInterceptor.interceptComponent(component);
            } else {
                this.log(
                    LogLevel.Warn,
                    'No interceptComponent export in',
                    `${currentPath}/${myPath}`,
                );
            }
        });
    };

    private resolveCoreFiles = async (
        paths: string[],
        callBack: (path: string) => string,
    ) => {
        const currentPath = process.cwd();

        const relativePathMap: {
            myPath: string;
            relativePath: string;
        }[] = [];

        await Promise.all(
            paths.map(async (myPath: string) => {
                const relativePath = callBack(myPath);
                const absolutePath = path.resolve(currentPath, relativePath);

                try {
                    const stat = await fsStat(absolutePath);
                    if (stat && stat.isFile()) {
                        relativePathMap.push({ myPath, relativePath });
                    }
                } catch (e) {
                    this.log(
                        LogLevel.Warn,
                        'File not exits in core: ' + e,
                        absolutePath,
                    );
                }
            }),
        );

        return relativePathMap;
    };

    private buildRegex = (targetablesSearchPaths: string[]): RegExp => {
        const componentPaths: string[] = [];
        const rootPaths: string[] = [];

        targetablesSearchPaths.forEach((tmpPath: string) => {
            const [rootPath, componentPath] = tmpPath.split('/', 2);
            componentPaths.push(componentPath);
            rootPaths.push(rootPath);
        });

        return new RegExp(
            `(${rootPaths.join('|')})/(?<type>${componentPaths.join('|')})`,
            '',
        );
    };

    private getReactComponent = (modulePath: string) => {
        if (this.componentsCache[modulePath] !== undefined) {
            return this.componentsCache[modulePath];
        }

        this.componentsCache[modulePath] = this.targetables.reactComponent(modulePath);

        return this.componentsCache[modulePath];
    };

    private static async getPathsByFileExtension(
        fileExtension: string,
        targetablesSearchPaths: string[],
    ) {
        return globby(targetablesSearchPaths, {
            expandDirectories: {
                files: [fileExtension],
            },
        });
    }

    private log(level: LogLevel, message: string, ...args: any[]) {
        if (this.logLevel >= level) {
            // eslint-disable-next-line default-case
            switch (level) {
                case LogLevel.Warn:
                    // eslint-disable-next-line no-console
                    console.warn(message, args);
                    break;
                case LogLevel.Debug:
                    // eslint-disable-next-line no-console
                    console.debug(message, args);
                    break;
            }
        }
    }
}

// eslint-disable-next-line
export { LogLevel, ExtendPagebuilderComponentIntercept };
module.exports.ExtendPagebuilderComponentIntercept = ExtendPagebuilderComponentIntercept;
