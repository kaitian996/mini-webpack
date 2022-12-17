import { describe, it, expect } from "vitest"
import { SyncHook } from "../hooks/index"
// The two tests marked with concurrent will be run in parallel
describe("hook test", () => {
    it("serial test", async () => {
        /* ... */
        const hook = new SyncHook()
        let number = 0
        hook.tap('lis 1', () => {
            number++
        })
        hook.tap('lis 1', () => {
            number++
        })
        hook.tap('lis 1', () => {
            number++
        })
        hook.tap('lis 1', () => {
            number++
        })
        hook.call()
        expect(number).toBe(4)
    })
});
