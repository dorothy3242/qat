<template>
    <div class="col-md-6 col-lg-4 my-2" @click="selectDiscussion()">
        <div
            class="card card-individual"
            :class="['border-' + findRelevantMediation(), discussion.isNatOnly ? 'bg-primary' : '']"
            data-toggle="modal"
            data-target="#extendedInfo"
            :data-discussion="discussion.id"
        >
            <div class="card-body">
                <p class="wrap-text">
                    <a
                        v-if="discussion.discussionLink.length"
                        :href="discussion.discussionLink"
                        target="_blank"
                        @click.stop
                    >{{ discussion.title }}</a>
                    <span v-else>{{ discussion.title }}</span>
                </p>
                <div class="card-status" :class="discussion.isActive ? 'status-bar-active' : 'status-bar-inactive'" />
                <div class="card-icons">
                    <span class="small float-left">{{ discussion.createdAt.slice(0, 10) }}</span>
                    <i v-if="discussion.mode.includes('osu')" class="far fa-circle" />
                    <i v-if="discussion.mode.includes('taiko')" class="fas fa-drum" />
                    <i v-if="discussion.mode.includes('catch')" class="fas fa-apple-alt" />
                    <i v-if="discussion.mode.includes('mania')" class="fas fa-stream" />
                    <span v-if="discussion.mode.includes('all')">
                        <i class="far fa-circle" />
                        <i class="fas fa-drum" />
                        <i class="fas fa-apple-alt" />
                        <i class="fas fa-stream" />
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'DiscussionCard',
    props: {
        discussion: {
            type: Object,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'userId',
        ]),
    },
    methods: {
        selectDiscussion() {
            this.$store.commit('setSelectedDiscussionVoteId', this.discussion.id);
        },
        findRelevantMediation() {
            let vote;
            this.discussion.mediations.forEach(m => {
                if (m.mediator && m.mediator.id == this.userId) {
                    if (m.vote == 1) {
                        vote = 'pass';
                    } else if (m.vote == 2) {
                        vote = 'neutral';
                    } else {
                        vote = 'fail';
                    }
                }
            });

            return vote;
        },
    },
};
</script>

<style scoped>

.status-bar-active {
    background: radial-gradient(#fff, transparent 70%);
}

.status-bar-inactive {
    background: radial-gradient(var(--gray), transparent 70%);
}

</style>
