import BrandHeader from "./BrandHeader";
import FeatureList from "./FeatureList";
import StatsGrid from "./StatsGrid";

function LeftSidebar() {
  return (
    <div className="hidden lg:flex flex-col gap-6 animate-in fade-in slide-in-from-left-8 duration-700">
      <BrandHeader />
      <FeatureList />
      <StatsGrid />
    </div>
  );
}

export default LeftSidebar;