/// <reference path="globals/meteor/index.d.ts" />

declare module "meteor/percolate:synced-cron" {
  export module SyncedCron {
    function add (options: { name: string, schedule: ((parser: any) => any), job: any })
    function start(): any
  }
}
