input:`Simple`

code: 
```typescript
type tables = {
    User: {
        id: number;
        name: string;
    },
    Post: {
        id: number;
        title: string;
        deep: {
            foo: 'bar'
        }
    }
};

type Simple = {
    [k in keyof tables]: k
}
```
Generates the correct output. But the trace doesn't feel intuitve for a user to step through.
Can we improve it?
