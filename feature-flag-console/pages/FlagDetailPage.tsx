import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Trash2, X, Plus } from 'lucide-react';
import { getFlag, updateFlag, evaluateFlag } from '../services/api';
import { FeatureFlag, Environment, Operator, TargetingRule, UserContext, FlagType } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';

const EnvironmentPill: React.FC<{
    env: Environment;
    activeEnv: Environment;
    onClick: (env: Environment) => void;
}> = ({ env, activeEnv, onClick }) => (
    <button
        onClick={() => onClick(env)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeEnv === env
                ? 'bg-gradient-to-r from-brand-start to-brand-end text-white shadow-soft'
                : 'bg-white/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
        }`}
    >
        {env.charAt(0).toUpperCase() + env.slice(1)}
    </button>
);

const COMMON_ATTRIBUTES = ['userId', 'role', 'region', 'email', 'plan', 'countryCode'];

interface RuleEditorProps {
    rule: TargetingRule;
    isEditing: boolean;
    onChange: (updatedRule: TargetingRule) => void;
    onRemove: () => void;
}

const RuleEditor: React.FC<RuleEditorProps> = ({ rule, isEditing, onChange, onRemove }) => {
    const [newValue, setNewValue] = useState('');
    const handleAddValue = () => {
        if (newValue.trim() === '') return;
        const currentValues = rule.values.filter(v => v && v.trim() !== '');
        if (!currentValues.includes(newValue.trim())) {
             onChange({ ...rule, values: [...currentValues, newValue.trim()] });
        }
        setNewValue('');
    };
    const handleRemoveValue = (valueToRemove: string) => onChange({ ...rule, values: rule.values.filter(v => v !== valueToRemove) });
    const isMultiValue = [Operator.IN, Operator.NOT_IN].includes(rule.operator);
    const actualValues = rule.values.filter(v => v && v.trim() !== '');
    const formElClasses = "form-input w-full rounded-md border-gray-300/80 dark:border-gray-600 shadow-sm text-sm bg-white/80 dark:bg-gray-700/50 focus:ring-brand-start/50 focus:border-brand-start";

    return (
        <div className="flex items-start gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-200/60 dark:border-gray-700/60">
            <div className="w-1/4">
                <input type="text" value={rule.attribute} onChange={(e) => onChange({ ...rule, attribute: e.target.value })} disabled={!isEditing} placeholder="Attribute" className={formElClasses} list="common-attributes" />
                <datalist id="common-attributes">{COMMON_ATTRIBUTES.map(attr => <option key={attr} value={attr} />)}</datalist>
            </div>
            <select value={rule.operator} onChange={(e) => onChange({...rule, operator: e.target.value as Operator, values: [Operator.IN, Operator.NOT_IN].includes(e.target.value as Operator) ? rule.values : [rule.values[0] || '']})} disabled={!isEditing} className="form-select rounded-md border-gray-300/80 dark:border-gray-600 shadow-sm text-sm bg-white/80 dark:bg-gray-700/50 focus:ring-brand-start/50 focus:border-brand-start">
                {Object.values(Operator).map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <div className="flex-grow">
                {isMultiValue ? (
                    <div className={`flex flex-wrap items-center gap-2 p-1.5 border rounded-md transition-shadow ${isEditing ? 'bg-white/80 dark:bg-gray-700/50 border-gray-300/80 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-start/50 focus-within:border-brand-start' : 'bg-gray-100 dark:bg-gray-700/20 border-gray-200/80 dark:border-gray-700/40 cursor-not-allowed'}`}>
                        {actualValues.map((val) => (
                            <span key={val} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold text-xs rounded-full px-2 py-0.5 border border-indigo-200 dark:border-indigo-700/50">
                                {val}
                                {isEditing && <button type="button" onClick={() => handleRemoveValue(val)} className="text-indigo-500 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors p-0.5"><X size={14} /></button>}
                            </span>
                        ))}
                         {isEditing && (
                            <div className="flex-grow flex items-center min-w-[150px]">
                                <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddValue(); } if (e.key === 'Backspace' && newValue === '' && actualValues.length > 0) { handleRemoveValue(actualValues[actualValues.length - 1]); }}} placeholder={actualValues.length > 0 ? 'Add another...' : 'Add value...'} className="flex-grow p-1 border-none focus:ring-0 text-sm bg-transparent w-full" />
                                <button type="button" onClick={handleAddValue} className="px-3 py-1 bg-gradient-to-r from-brand-start to-brand-end text-white text-sm rounded-md hover:opacity-90 flex items-center gap-1 shrink-0"><Plus size={16} /> Add</button>
                            </div>
                        )}
                        {!isEditing && actualValues.length === 0 && <span className="text-sm text-gray-500 dark:text-gray-400 p-1">No values set.</span>}
                    </div>
                ) : ( <input type="text" value={rule.values[0] || ''} onChange={(e) => onChange({ ...rule, values: [e.target.value] })} disabled={!isEditing} placeholder="Value" className={formElClasses} /> )}
            </div>
            {isEditing && <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mt-0.5"><Trash2 size={18} /></button>}
        </div>
    );
};

const FlagDetailPage: React.FC = () => {
    const { flagKey } = useParams<{ flagKey: string }>();
    const { user } = useContext(AuthContext);
    const [flag, setFlag] = useState<FeatureFlag | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeEnv, setActiveEnv] = useState<Environment>('production');
    const [isEditing, setIsEditing] = useState(false);
    const [editableFlag, setEditableFlag] = useState<FeatureFlag | null>(null);
    const [saving, setSaving] = useState(false);
    const [evalContext, setEvalContext] = useState<string>('{\n  "userId": "user-123",\n  "role": "admin",\n  "region": "US"\n}');
    const [evalResult, setEvalResult] = useState<{ value: string | boolean; reason: string } | null>(null);

    const fetchFlagData = useCallback(async () => {
        if (!flagKey) return;
        setLoading(true);
        try {
            const data = await getFlag(flagKey);
            if (data) {
                setFlag(data);
                setEditableFlag(JSON.parse(JSON.stringify(data)));
            }
        } catch (error) { console.error("Failed to fetch flag", error); } 
        finally { setLoading(false); }
    }, [flagKey]);

    useEffect(() => { fetchFlagData(); }, [fetchFlagData]);

    const handleSave = async () => {
        if (!editableFlag || !flagKey || !user) return;
        setSaving(true);
        try {
            const updatedFlag = await updateFlag(flagKey, editableFlag, user.email);
            setFlag(updatedFlag);
            setEditableFlag(JSON.parse(JSON.stringify(updatedFlag)));
            setIsEditing(false);
        } catch (error) { console.error("Failed to save flag", error); } 
        finally { setSaving(false); }
    };
    const handleAddRule = () => {
        if (!editableFlag) return;
        const newRule: TargetingRule = { id: `rule-${Date.now()}`, attribute: '', operator: Operator.EQUALS, values: [''] };
        const newFlagState = JSON.parse(JSON.stringify(editableFlag));
        newFlagState.environments[activeEnv].rules.push(newRule);
        setEditableFlag(newFlagState);
    };
    const handleRemoveRule = (ruleId: string) => {
        if (!editableFlag) return;
        const newFlagState = JSON.parse(JSON.stringify(editableFlag));
        newFlagState.environments[activeEnv].rules = newFlagState.environments[activeEnv].rules.filter((r: TargetingRule) => r.id !== ruleId);
        setEditableFlag(newFlagState);
    };
    const handleRuleChange = (ruleId: string, updatedRule: TargetingRule) => {
        if (!editableFlag) return;
        const newFlagState = JSON.parse(JSON.stringify(editableFlag));
        const rules = newFlagState.environments[activeEnv].rules as TargetingRule[];
        const ruleIndex = rules.findIndex(r => r.id === ruleId);
        if (ruleIndex > -1) rules[ruleIndex] = updatedRule;
        setEditableFlag(newFlagState);
    };
    const handleRunEvaluation = async () => {
        if (!flagKey) return;
        try {
            const context: UserContext = JSON.parse(evalContext);
            const result = await evaluateFlag(flagKey, activeEnv, context);
            setEvalResult(result);
        } catch (error) { setEvalResult({ value: 'Error', reason: 'Invalid JSON context.' }); }
    }

    if (loading) return <div className="flex justify-center mt-20"><Spinner className="w-16 h-16" /></div>;
    if (!flag || !editableFlag) return <div className="text-center mt-20">Flag not found.</div>;

    const currentEnvConfig = editableFlag.environments[activeEnv];
    const cardClasses = "p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm shadow-soft";

    return (
        <div className="max-w-7xl mx-auto">
            <Link to="/flags" className="flex items-center gap-2 text-brand-start font-semibold hover:underline mb-6 transition-all"><ArrowLeft size={16} /> Back to all flags</Link>
            <div className={`${cardClasses} p-8`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-secondary dark:text-secondary-dark">{flag.name}</h1>
                        <p className="text-sm text-medium dark:text-medium-dark font-mono mt-1">{flag.key}</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">{flag.description}</p>
                    </div>
                    <div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditing(false); setEditableFlag(JSON.parse(JSON.stringify(flag))); }} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                                {/* FIX: Replaced invalid JSX tag `<mrow>` with a proper conditional rendering expression `{}`. */}
                                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 flex items-center gap-2 transition-opacity">{ saving ? <Spinner className="w-5 h-5" /> : <Save size={16} />} Save</button>
                            </div>
                        ) : ( <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-start to-brand-end text-white hover:opacity-90 flex items-center gap-2 transition-opacity"><Edit size={16} /> Edit</button> )}
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200/80 dark:border-gray-700/80 pt-8">
                    <div className="flex gap-2 mb-8 p-2 bg-gray-500/5 dark:bg-gray-800/50 rounded-full w-min">
                        {(['development', 'staging', 'production'] as Environment[]).map(env => <EnvironmentPill key={env} env={env} activeEnv={activeEnv} onClick={setActiveEnv} />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className={`${cardClasses}`}>
                                <h3 className="font-semibold text-lg mb-4 text-secondary dark:text-secondary-dark">Targeting Rules</h3>
                                <div className="space-y-3">
                                    {currentEnvConfig.rules.map((rule) => ( <RuleEditor key={rule.id} rule={rule} isEditing={isEditing} onChange={(updatedRule) => handleRuleChange(rule.id, updatedRule)} onRemove={() => handleRemoveRule(rule.id)} /> ))}
                                    {currentEnvConfig.rules.length === 0 && ( <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No targeting rules for this environment.</p> )}
                                </div>
                                {isEditing && <button onClick={handleAddRule} className="text-sm text-brand-start font-semibold hover:underline mt-4 flex items-center gap-1"><Plus size={14} /> Add Rule</button>}
                            </div>
                            <div className={`${cardClasses}`}>
                                <h3 className="font-semibold text-lg mb-4 text-secondary dark:text-secondary-dark">Evaluation Preview</h3>
                                <textarea className="w-full h-32 p-2 font-mono text-sm border-gray-300/80 dark:border-gray-600 bg-white/80 dark:bg-gray-700/50 rounded-md focus:ring-brand-start/50 focus:border-brand-start" value={evalContext} onChange={(e) => setEvalContext(e.target.value)} />
                                <button onClick={handleRunEvaluation} className="mt-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-brand-start dark:text-indigo-300 font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition-colors">Evaluate</button>
                                {evalResult && (
                                    <div className="mt-4 p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded">
                                        <p><span className="font-semibold">Result: </span><Badge color={evalResult.value === true ? 'green' : evalResult.value === false ? 'red' : 'blue'}>{String(evalResult.value)}</Badge></p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Reason: </span>{evalResult.reason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className={cardClasses}>
                                <h3 className="font-semibold text-lg mb-4 text-secondary dark:text-secondary-dark">Status</h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700 dark:text-gray-300">Service: </span>
                                    {isEditing ? (
                                        <select value={currentEnvConfig.enabled.toString()} onChange={(e) => { const newFlagState = JSON.parse(JSON.stringify(editableFlag)); newFlagState.environments[activeEnv].enabled = e.target.value === 'true'; setEditableFlag(newFlagState); }} className="form-select rounded-md border-gray-300/80 dark:border-gray-600 bg-white/80 dark:bg-gray-700 focus:ring-brand-start/50 focus:border-brand-start">
                                            <option value="true">Enabled</option>
                                            <option value="false">Disabled</option>
                                        </select>
                                    ) : ( <Badge color={currentEnvConfig.enabled ? 'green' : 'red'}>{currentEnvConfig.enabled ? 'Enabled' : 'Disabled'}</Badge> )}
                                </div>
                            </div>
                            <div className={cardClasses}>
                                <h3 className="font-semibold text-lg mb-4 text-secondary dark:text-secondary-dark">Rollout</h3>
                                <label htmlFor="rollout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Percentage</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <input id="rollout" type="range" min="0" max="100" disabled={!isEditing} value={currentEnvConfig.rolloutPercentage} onChange={(e) => { const newFlagState = JSON.parse(JSON.stringify(editableFlag)); newFlagState.environments[activeEnv].rolloutPercentage = parseInt(e.target.value, 10); setEditableFlag(newFlagState); }} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer range-thumb:bg-brand-start" />
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 w-12 text-center">{currentEnvConfig.rolloutPercentage}%</span>
                                </div>
                            </div>
                            {flag.type === FlagType.MULTIVARIATE && (
                                <div className={cardClasses}>
                                    <h3 className="font-semibold text-lg mb-4 text-secondary dark:text-secondary-dark">Variations</h3>
                                    <div className="space-y-2">
                                        {flag.variations.map(v => ( <div key={v.id} className="flex justify-between p-2 bg-gray-50/80 dark:bg-gray-700/50 rounded"><span>{v.name} (<code className="text-sm">{v.value}</code>)</span><span className="font-semibold">{v.weight}%</span></div> ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlagDetailPage;