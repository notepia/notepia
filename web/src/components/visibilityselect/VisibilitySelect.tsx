import { Building, ChevronDown, ChevronUp, Globe, Lock } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Visibility } from "@/types/visibility";

interface Props {
    value: string
    onChange: (visibility: Visibility) => void
}

const VisibilitySelect: FC<Props> = ({ value }) => {
    const { t } = useTranslation();

    return <div>
        {value}
    </div>
};

export default VisibilitySelect;
