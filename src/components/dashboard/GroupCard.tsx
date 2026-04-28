import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ChevronRight } from "lucide-react";
import { Group } from "@/api/types";

interface GroupCardProps {
    group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
    const memberCount = (group.members?.length || 0);

    return (
        <Link to={createPageUrl(`GroupDetail?id=${group.id}`)}>
            <Card className="group hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{group.name}</CardTitle>
                                {group.description && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{group.description}</p>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex -space-x-1.5">
                            {Array.from({ length: Math.min(memberCount, 4) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                                >
                                    <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
