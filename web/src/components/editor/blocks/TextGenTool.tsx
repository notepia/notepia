import ReactDOM from "react-dom/client";
import TextGenBlock, { TextGenModel, TextGenRequest, TextGenResponse } from "./TextGenBlock";


export interface TextGenToolConfig {
  onListModels: () => TextGenModel[]
  onGenerate: (req: TextGenRequest) => TextGenResponse
}

export default class TextGenTool {
  data: any;
  api: any;
  config: TextGenToolConfig;
  root: ReactDOM.Root | null = null;

  constructor({ data, api, config }: { data: any; api: any; config:any }) {
    this.data = data || {};
    this.api = api;
    this.config = config
  }

  static get toolbox() {
    return {
      title: "TextGen",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkle-icon lucide-sparkle"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>',
    };
  }

  render() {
    const wrapper = document.createElement("div");
    this.root = ReactDOM.createRoot(wrapper);

    this.root.render(
      <TextGenBlock
        onListModels={this.config.onListModels}
        onGenerate={this.config.onGenerate}
      />
    );

    return wrapper;
  }

  save() {
    return this.data;
  }

  destroy() {
    this.root?.unmount();
  }
}
