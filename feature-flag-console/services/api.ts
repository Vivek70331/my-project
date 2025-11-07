import { FeatureFlag, AuditLog, FlagStatus, FlagType, Operator, Environment, TargetingRule, Variation, NewFlagPayload, User } from '../types';

// In-memory data to simulate a database
let flags: FeatureFlag[] = [
  {
    id: '1',
    key: 'new-dashboard-layout',
    name: 'New Dashboard Layout',
    description: 'Enables the redesigned dashboard experience with new widgets.',
    type: FlagType.BOOLEAN,
    status: FlagStatus.ACTIVE,
    tags: ['ui', 'dashboard'],
    owner: 'frontend-team@example.com',
    variations: [
        { id: 'v1-true', value: 'true', name: 'Enabled', weight: 100 },
        { id: 'v1-false', value: 'false', name: 'Disabled', weight: 0 },
    ],
    environments: {
      development: { enabled: true, rolloutPercentage: 100, rules: [], offVariantId: 'v1-false' },
      staging: { enabled: true, rolloutPercentage: 50, rules: [{ id: 'rule1', attribute: 'role', operator: Operator.EQUALS, values: ['admin'] }], offVariantId: 'v1-false' },
      production: { enabled: false, rolloutPercentage: 0, rules: [], offVariantId: 'v1-false' },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '2',
    key: 'checkout-button-color',
    name: 'Checkout Button Color',
    description: 'A/B test for the color of the main checkout button to optimize conversion.',
    type: FlagType.MULTIVARIATE,
    status: FlagStatus.ACTIVE,
    tags: ['ab-test', 'checkout', 'ux'],
    owner: 'product-team@example.com',
    variations: [
        { id: 'v2-control', value: 'blue', name: 'Blue (Control)', weight: 50 },
        { id: 'v2-challenger', value: 'green', name: 'Green (Challenger)', weight: 50 },
    ],
    environments: {
      development: { enabled: true, rolloutPercentage: 100, rules: [], fallthroughVariantId: 'v2-control' },
      staging: { enabled: true, rolloutPercentage: 100, rules: [], fallthroughVariantId: 'v2-control' },
      production: { enabled: true, rolloutPercentage: 20, rules: [{ id: 'rule2', attribute: 'region', operator: Operator.IN, values: ['US', 'CA'] }], fallthroughVariantId: 'v2-control' },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    key: 'api-rate-limiting-v2',
    name: 'API Rate Limiting V2',
    description: 'Enables the new, more efficient rate limiting algorithm for public APIs.',
    type: FlagType.BOOLEAN,
    status: FlagStatus.INACTIVE,
    tags: ['backend', 'performance'],
    owner: 'platform-team@example.com',
     variations: [
        { id: 'v3-true', value: 'true', name: 'Enabled', weight: 100 },
        { id: 'v3-false', value: 'false', name: 'Disabled', weight: 0 },
    ],
    environments: {
      development: { enabled: true, rolloutPercentage: 100, rules: [], offVariantId: 'v3-false' },
      staging: { enabled: false, rolloutPercentage: 0, rules: [], offVariantId: 'v3-false' },
      production: { enabled: false, rolloutPercentage: 0, rules: [], offVariantId: 'v3-false' },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

let auditLogs: AuditLog[] = [
    {
        id: 'log1',
        flagId: '2',
        timestamp: new Date().toISOString(),
        user: 'jane.doe@example.com',
        action: 'UPDATE_ROLLOUT',
        details: {
            before: { environments: { production: { rolloutPercentage: 10 } } } as any,
            after: { environments: { production: { rolloutPercentage: 20 } } } as any,
        }
    },
    {
        id: 'log2',
        flagId: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        user: 'jane.doe@example.com',
        action: 'ADD_RULE',
        details: {
            before: { environments: { production: { rules: [] } } } as any,
            after: { environments: { production: { rules: [{ id: 'rule2', attribute: 'region', operator: Operator.IN, values: ['US', 'CA'] }] } } } as any,
        }
    }
];

let users: (User & { passwordHash: string })[] = [
    { id: 'user1', email: 'current.user@example.com', passwordHash: 'password123' }
];


const delay = <T,>(data: T, ms = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

// --- Auth API ---
export const login = async (email: string, password_DO_NOT_USE: string): Promise<User> => {
    const user = users.find(u => u.email === email && u.passwordHash === password_DO_NOT_USE);
    if (user) {
        const { passwordHash, ...userPayload } = user;
        return delay(userPayload);
    }
    throw new Error('Invalid email or password');
};

export const register = async (email: string, password_DO_NOT_USE: string): Promise<User> => {
    if (users.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
    }
    const newUser = {
        id: `user${Date.now()}`,
        email,
        passwordHash: password_DO_NOT_USE,
    };
    users.push(newUser);
    const { passwordHash, ...userPayload } = newUser;
    return delay(userPayload);
};


// --- Feature Flag API ---
export const getFlags = async (): Promise<FeatureFlag[]> => {
  return delay([...flags]);
};

export const getFlag = async (key: string): Promise<FeatureFlag | undefined> => {
  const flag = flags.find(f => f.key === key);
  return delay(flag ? {...flag} : undefined);
};

export const createFlag = async (payload: NewFlagPayload, userEmail: string): Promise<FeatureFlag> => {
    if (flags.some(f => f.key === payload.key)) {
        throw new Error('A flag with this key already exists.');
    }

    const newId = String(Date.now());
    const now = new Date().toISOString();
    
    let variations: Variation[];
    let defaultOffVariantId: string | undefined;
    let defaultFallthroughVariantId: string | undefined;

    if (payload.type === FlagType.BOOLEAN) {
        const trueVarId = `v${newId}-true`;
        const falseVarId = `v${newId}-false`;
        variations = [
            { id: trueVarId, value: 'true', name: 'Enabled', weight: 100 },
            { id: falseVarId, value: 'false', name: 'Disabled', weight: 0 },
        ];
        defaultOffVariantId = falseVarId;
    } else { // MULTIVARIATE
        const controlVarId = `v${newId}-control`;
        const treatmentVarId = `v${newId}-treatment`;
         variations = [
            { id: controlVarId, value: 'control', name: 'Control', weight: 50 },
            { id: treatmentVarId, value: 'treatment', name: 'Treatment', weight: 50 },
        ];
        defaultFallthroughVariantId = controlVarId;
    }

    const newFlag: FeatureFlag = {
        ...payload,
        id: newId,
        status: FlagStatus.INACTIVE,
        variations,
        environments: {
            development: { enabled: true, rolloutPercentage: 100, rules: [], offVariantId: defaultOffVariantId, fallthroughVariantId: defaultFallthroughVariantId },
            staging: { enabled: false, rolloutPercentage: 0, rules: [], offVariantId: defaultOffVariantId, fallthroughVariantId: defaultFallthroughVariantId },
            production: { enabled: false, rolloutPercentage: 0, rules: [], offVariantId: defaultOffVariantId, fallthroughVariantId: defaultFallthroughVariantId },
        },
        createdAt: now,
        updatedAt: now,
    };

    flags.push(newFlag);

    const log: AuditLog = {
        id: `log${Date.now()}`,
        flagId: newFlag.id,
        timestamp: now,
        user: userEmail,
        action: 'CREATE_FLAG',
        details: { before: {}, after: newFlag }
    };
    auditLogs.unshift(log);

    return delay(newFlag);
};

export const updateFlag = async (key: string, updates: Partial<FeatureFlag>, userEmail: string): Promise<FeatureFlag> => {
    const flagIndex = flags.findIndex(f => f.key === key);
    if (flagIndex === -1) {
        throw new Error('Flag not found');
    }

    const oldFlag = { ...flags[flagIndex] };
    const updatedFlag = { ...oldFlag, ...updates, updatedAt: new Date().toISOString() };
    flags[flagIndex] = updatedFlag;
    
    const log: AuditLog = {
        id: `log${Date.now()}`,
        flagId: updatedFlag.id,
        timestamp: updatedFlag.updatedAt,
        user: userEmail,
        action: 'UPDATE_FLAG_CONFIG',
        details: { before: oldFlag, after: updatedFlag }
    };
    auditLogs.unshift(log);

    return delay(updatedFlag);
};

export const getAuditHistory = async (flagId: string): Promise<AuditLog[]> => {
  const history = auditLogs.filter(log => log.flagId === flagId);
  return delay(history);
};

const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
};

export const evaluateFlag = async (
    key: string,
    environment: Environment,
    context: { [key: string]: any }
): Promise<{value: string | boolean; reason: string}> => {
    const flag = flags.find(f => f.key === key);
    if (!flag) return { value: false, reason: 'Flag not found' };

    const envConfig = flag.environments[environment];
    if (!envConfig.enabled) {
        const offVariant = flag.variations.find(v => v.id === envConfig.offVariantId);
        return { value: offVariant?.value === 'true' ? true : offVariant?.value || false, reason: 'Flag disabled in environment' };
    }

    for (const rule of envConfig.rules) {
        const contextValue = context[rule.attribute];
        if (contextValue !== undefined) {
            let match = false;
            const ruleValues = rule.values.map(v => v.toLowerCase());
            const cv_s = String(contextValue).toLowerCase();

            switch (rule.operator) {
                case Operator.EQUALS: match = cv_s === ruleValues[0]; break;
                case Operator.NOT_EQUALS: match = cv_s !== ruleValues[0]; break;
                case Operator.IN: match = ruleValues.includes(cv_s); break;
                case Operator.NOT_IN: match = !ruleValues.includes(cv_s); break;
                case Operator.GREATER_THAN: match = parseFloat(cv_s) > parseFloat(ruleValues[0]); break;
                case Operator.LESS_THAN: match = parseFloat(cv_s) < parseFloat(ruleValues[0]); break;
            }
            if (match) {
                 return { value: flag.type === FlagType.BOOLEAN ? true : flag.variations[0].value, reason: `Matched rule: ${rule.attribute} ${rule.operator} ${rule.values.join(',')}` };
            }
        }
    }

    const userId = context.userId || 'anonymous';
    const hash = simpleHash(`${key}-${userId}`);
    const percentage = (hash % 100) + 1;

    if (percentage > envConfig.rolloutPercentage) {
        const offVariant = flag.variations.find(v => v.id === envConfig.offVariantId);
        return { value: offVariant?.value === 'true' ? true : offVariant?.value || false, reason: `Not in ${envConfig.rolloutPercentage}% rollout`};
    }

    if(flag.type === FlagType.MULTIVARIATE) {
        const fallthroughVariant = flag.variations.find(v => v.id === envConfig.fallthroughVariantId);
        return { value: fallthroughVariant?.value || flag.variations[0].value, reason: 'Fallthrough to multivariate variant' };
    }
    
    return { value: true, reason: 'Fallthrough to enabled' };
};