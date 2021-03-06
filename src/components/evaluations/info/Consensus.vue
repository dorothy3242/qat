<template>
    <div>
        <p>
            <b>Consensus:</b>
            <span
                v-if="consensus"
                :class="consensusColor"
            >
                {{ consensusText }}
            </span>
            <span v-if="!isArchive">
                <button
                    class="btn btn-sm btn-pass ml-2"
                    :disabled="consensus == 'pass' && !isLowActivity"
                    @click="setConsensus('pass', $event);"
                >
                    Pass
                </button>
                <button
                    v-if="!isApplication"
                    class="btn btn-sm btn-probation"
                    :disabled="consensus == 'probation'"
                    @click="setConsensus('probation', $event);"
                >
                    Probation
                </button>
                <button
                    class="btn btn-sm btn-fail"
                    :disabled="consensus == 'fail' && !resignedOnGoodTerms && !resignedOnStandardTerms"
                    @click="setConsensus('fail', $event);"
                >
                    Fail
                </button>
            </span>
        </p>

        <p v-if="!isArchive && !isApplication">
            <button
                class="btn btn-sm btn-danger mt-2"
                :disabled="consensus == 'fail' && resignedOnGoodTerms"
                @click="setConsensus('fail', $event, 'resignedOnGoodTerms');"
            >
                Resign on good terms
            </button>
            <button
                class="btn btn-sm btn-danger mt-2"
                :disabled="consensus == 'fail' && resignedOnStandardTerms"
                @click="setConsensus('fail', $event, 'resignedOnStandardTerms');"
            >
                Resign on standard terms
            </button>
            <button
                class="btn btn-sm btn-success mt-2"
                :disabled="consensus == 'pass' && isLowActivity"
                @click="setConsensus('pass', $event, 'isLowActivity');"
            >
                Low activity warning
            </button>
            <button
                v-if="group == 'bn'"
                class="btn btn-sm btn-success mt-2"
                :disabled="isMoveToNat"
                @click="setConsensus('pass', $event, 'isMoveToNat');"
            >
                Move to NAT
            </button>
            <button
                v-else
                class="btn btn-sm btn-success mt-2"
                :disabled="isMoveToBn"
                @click="setConsensus('pass', $event, 'isMoveToBn');"
            >
                Move to BN
            </button>
        </p>
    </div>
</template>

<script>
import postData from '../../../mixins/postData.js';

export default {
    name: 'Consensus',
    mixins: [ postData ],
    props: {
        consensus: {
            type: String,
            default: null,
        },
        nominatorAssessmentMongoId: {
            type: String,
            default: '',
        },
        isApplication: Boolean,
        isLowActivity: Boolean,
        resignedOnGoodTerms: Boolean,
        resignedOnStandardTerms: Boolean,
        isMoveToNat: Boolean,
        isMoveToBn: Boolean,
        isArchive: Boolean,
        group: {
            type: String,
            default: 'user',
        },
    },
    computed: {
        consensusText() {
            if (!this.consensus) {
                return 'none';
            } else if (this.consensus == 'pass') {
                if (this.isLowActivity) {
                    return 'pass + low activity warning';
                } else if (this.isMoveToNat) {
                    return 'pass + move to NAT';
                } else if (this.isMoveToBn) {
                    return 'pass + move to BN';
                } else {
                    return this.consensus;
                }
            } else if (this.resignedOnGoodTerms) {
                return 'fail + resigned on good terms';
            } else if (this.resignedOnStandardTerms) {
                return 'fail + resigned on standard terms';
            } else {
                return this.consensus;
            }
        },
        consensusColor() {
            if (!this.consensus) {
                return '';
            } else {
                return 'text-' + this.consensus;
            }
        },
    },
    methods: {
        async setConsensus(consensus, e, addition) {
            const result = await this.executePost(
                `/${this.isApplication ? 'appEval' : 'bnEval'}/setConsensus/` + this.nominatorAssessmentMongoId, {
                    consensus,
                    isLowActivity: addition == 'isLowActivity',
                    resignedOnGoodTerms: addition == 'resignedOnGoodTerms',
                    resignedOnStandardTerms: addition == 'resignedOnStandardTerms',
                    isMoveToNat: addition == 'isMoveToNat',
                    isMoveToBn: addition == 'isMoveToBn',
                }, e);

            if (result && !result.error) {
                this.$store.dispatch(this.isApplication ? 'updateApplication' : 'updateEvalRound', result);
                this.$store.dispatch('updateToastMessages', {
                    message: `Saved consensus`,
                    type: 'success',
                });
            }
        },
    },
};
</script>
