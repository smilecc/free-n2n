import { useCommonStore } from "@/stores";
import { Prism } from "@mantine/prism";
import { Observer } from "mobx-react-lite";
import React from "react";

export const LogPage: React.FC = () => {
  const commonStore = useCommonStore();

  return (
    <div>
      <Observer>
        {() => (
          <Prism
            language="markdown"
            style={{ width: "calc(100vw - 350px)" }}
            styles={{
              scrollArea: { height: "calc(100vh - 32px)" },
            }}
          >
            {commonStore.logContent}
          </Prism>
        )}
      </Observer>
    </div>
  );
};
