Skyderby.views.Scoreboard = Backbone.View.extend({

    el: '#results-table',

    events: {
       'click .edit-result'      : 'on_edit_result_click',
       'click .show-result'      : 'on_show_result_click',
       'click .delete-round'     : 'on_delete_round_click'
    },
    
    units: {
        distance: I18n.t('units.m'),
        speed: I18n.t('units.kmh'),
        time: I18n.t('units.t_unit')
    },

    $discipline_row: null,
    $rounds_row: null,
    $units_row: null,
    $template_row: null,
    $table_footer: null,
    $table_footer_row: null,
    row_length: 3,

    header:      JST['app/templates/scoreboard_header'],
    round_cell:  JST['app/templates/round_cell'],

    initialize: function(opts) {
        this.$el.append(this.header());

        this.$discipline_row = $('#disciplines-row');
        this.$rounds_row     = $('#rounds-row');
        this.$units_row      = $('#units-row');
        this.$template_row   = this.$el.find('.template-row');

        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;

        this.rules = this.model.get('rules');
    },


    ////////////////////////////////////////////////////////////
    // Event handlers
    //

    // Competitors

    // edit_competitor_click: function(e) {
    //     e.preventDefault();
    //     var competitor_id = $(this).closest('tr')
    //                                .attr('id')
    //                                .replace('competitor_', '');
    //     window.Competition.competitor_by_id(competitor_id).open_form();
    //
    // },
    //
    // delete_competitor_click: function(e) {
    //     e.preventDefault(); 
    //     var competitor_id = $(this).closest('tr')
    //                                .attr('id')
    //                                .replace('competitor_', '');
    //     window.Competition.competitor_by_id(competitor_id).destroy();
    // },

    // Rounds
    
    on_delete_round_click: function(e) {
        e.preventDefault();
        var round_id = $(this).closest('td').data('round-id');
        window.Competition.round_by_id(round_id).destroy();
    },

    // Results

    on_edit_result_click: function(e) {
        e.preventDefault();  
        var result_id = $(e.currentTarget).attr('data-result-id');
        if (result_id) {
            window.Competition.result_by_id(result_id).open_form();
        } else {
            var competitor_id = 
                $(e.currentTarget).closest('tr').attr('id').replace('competitor_', '');
            var result = new Skyderby.models.EventTrack({
                competitor_id: competitor_id,
                round_id: $(e.currentTarget).data('round-id')
            });
            var result_form = new Skyderby.views.EventTrackForm({model: result});
            result_form.render().open();
        }
    },

    on_show_result_click: function(e) {
        e.preventDefault();  
        var result_id = $(this).attr('data-result-id');
        if (result_id) {
            window.Competition.result_by_id(result_id).open_form();
        }   
    },

    ///////////////////////////////////////////////////////////////
    // Rendering
    //
    render_round: function(round) {
        this.$rounds_row.append(this.round_cell(
            $.extend(round.toJSON(), {
                can_manage: this.can_manage, 
                rules: this.rules
            })
        ));

        this.$units_row.append(
            $('<td>')
                .text(this.units[round.get('discipline')])
                .addClass('text-center')
                .attr('data-discipline', round.get('discipline'))
                .attr('data-role', 'unit')
                .attr('data-round-id', round.id)
        );

        // this.$template_row.append(this.result_cell({
        //     id: round.id,
        //     role: 'result',
        //     can_manage: can_manage
        // }));
        
        if (this.rules !== 'hungary_boogie') {
            this.$units_row.append(
                $('<td>')
                    .text('%')
                    .addClass('text-center')
                    .attr('data-discipline', round.get('discipline'))
                    .attr('data-role', 'points')
                    .attr('data-round-id', round.id)
            );

            // this.$template_row.append(this.result_cell({
            //     id: value.id,
            //     role: 'points',
            //     can_manage: can_manage
            // }));
        }
    },

    render_discipline: function(value, key) {
        var col_count;

        if (this.rules === 'hungary_boogie') {
            col_count = value.length;
        } else {
            col_count = value.length * 2 + 1;
        }

        this.row_length += col_count;
        this.$discipline_row.append(
            $('<td>')
                .text(I18n.t('disciplines.' + key))
                .addClass('text-center')
                .attr('colspan', col_count)
                .attr('data-discipline', key)
        );

        _.each(value, this.render_round.bind(this));

        if (this.rules !== 'hungary_boogie') {
            this.$rounds_row.append(
                $('<td>')
                    .text('%')
                    .addClass('text-center')
                    .attr('data-discipline', key)
                    .attr('data-role', 'points')
                    .attr('rowspan', 2)
            );
            this.$template_row.append(
                $('<td>')
                    .addClass('text-right')
                    .attr('data-discipline', key)
                    .attr('data-role', 'points')
                );
        }
    },

    render_section: function(section) {
        var section_view = new Skyderby.views.Section({
            model: section, 
            can_manage: this.can_manage,
            row_length: this.row_length
        });

        this.$el.append(section_view.render().$el);
    },

    render_competitor: function(competitor) {
        var competitor_view = new Skyderby.views.Competitor({
            model: competitor,
            can_manage: this.can_manage
        });
        $('#section_' + competitor.get('section_id')).append(competitor_view.render().$el);

        this.set_row_numbers();

        this.listenTo(competitor, 'change:section_id', this.move_competitor);

        // var can_manage = window.Competition.can_manage;

        // var new_row = this.$el.find('tr.template-row').clone();
        // new_row.removeClass('template-row').addClass('competitor-row');
        // new_row.attr('id', 'competitor_' + value.id);
        //
        // new_row.find("[data-role='competitor-name']")
        //     .attr('href', value.get('profile').url)
        //     .text(value.get('profile').name + ' ');
        // new_row.find("[data-role='competitor-suit']").text(value.get('wingsuit').name);
        // new_row.find("[data-role='competitor-country']")
        //     .text(value.get('country').code.toUpperCase())
        //     .attr('title', value.get('country').name);
        // if (can_manage) {
        //     new_row.find("[data-role='competitor-edit-ctrls']").html([
        //         '<a href="#" class="edit-competitor">',
        //             '<i class="fa fa-pencil text-muted"></i>',
        //         '</a>',
        //         '<a href="#" class="delete-competitor">',
        //             '<i class="fa fa-times-circle text-muted"></i>',
        //         '</a>'
        //     ].join('\n'));
        // }

    },

    move_competitor: function(competitor) {
        $('#section_' + competitor.get('section_id')).append(this.$('#competitor_' + competitor.id));
    },

    render_result: function(result) {
        var result_cell = $('#competitor_' + result.get('competitor_id') + 
                            ' td[data-round-id="' + result.get('round_id') + '"]' +
                            '[data-role="result"]'),
            points_cell = $('#competitor_' + result.get('competitor_id') +
                            ' td[data-round-id="' + result.get('round_id') + '"]' +
                            '[data-role="points"]'),
            max_val = window.Competition.max_results[result.get('round_id')],
            points = Math.round(result.get('result') / max_val * 1000) / 10;

        result_cell.attr('data-url', result.get('url') +
                         '?f=' + Competition.range_from +
                         '&t=' + Competition.range_to);

        result_cell.attr('data-track-id', result.get('track_id'));
        result_cell.attr('data-result-id', result.get('id'));

        result_cell.text(result.get('result'));
        points_cell.text(points.toFixed(1));
        points_cell.attr('data-result-id', result.get('id'));
    },

    set_row_numbers: function() {
        this.$el.find('tbody').each(function() {
            var row_ind = 1;
            $(this).find("[data-role='row_number']").each(function () {
                $(this).text(row_ind);
                row_ind += 1;
            });
        });
    },

    calculate_totals: function() {
        if (this.rules === 'hungary_boogie') {
            _.each(window.Competition.competitors, function(competitor) {
                var total_points = 0;

                var tracks = _.where(window.Competition.tracks, {competitor_id: competitor.id});
                if (tracks.length >= 3) {
                    var best_tracks = _.chain(tracks)
                        .sortBy(function(trk) { return -trk.result; })
                        .first(3)
                        .reduce(function(memo, num) { return memo + num.result }, 0)
                        .value();

                    total_points = best_tracks / 3;
                }

                var total_cell = $('#competitor_' + competitor.id + ' > td[data-role="total-points"]');
                if (total_points) {
                    total_cell.text(Math.round(total_points));
                } else {
                    total_cell.text('');
                }

            });

            this.indicate_best_worst_results();
        } else {
            window.Competition.competitors.each(function(competitor) {
                var competitor_row = $('#competitor_' + competitor.id);
                var total_points = 0;

                var rounds_by_discipline = window.Competition.rounds.groupBy('discipline');

                _.each(rounds_by_discipline, function(rounds, discipline) {
                    var discipline_points = 0;
                    _.each(rounds, function(value, index) {
                        discipline_points += +competitor_row.find(
                            'td[data-round-id="' + value.id + '"][data-role="points"]'
                        ).text();
                    });
                    var discipline_cell = competitor_row.find('td[data-discipline="' + discipline + '"]');
                    if (discipline_points) {
                        discipline_cell.text((discipline_points / rounds.length).toFixed(1)); 
                        total_points += discipline_points / rounds.length;
                    } else {
                       discipline_cell.text(''); 
                    }
                });

                var total_cell = competitor_row.find('td[data-role="total-points"]');
                if (total_points) {
                    total_cell.text(total_points.toFixed(2));
                } else {
                    total_cell.text('');
                }
            });
        }
    },

    indicate_best_worst_results: function() {

        $('.hc-best-result').removeClass('hc-best-result');
        $('.hc-worst-result').removeClass('hc-worst-result');

        _.each(window.Competition.sections, function(section) {
            var competitors_ids = 
                _.chain(window.Competition.competitors)
                    .filter(function(el) { return el.section.id === section.id; })
                    .map(function(el) { return el.id; })
                    .value();
            var results = 
                _.chain(window.Competition.tracks)
                    .filter(function(el) { return _.contains(competitors_ids, el.competitor_id); })
                    .sortBy(function(el) { return -el.result; })
                    .value();

            if (results.length) {
                $('td[data-result-id="' + _.last(results).id + '"]').addClass('hc-worst-result');
                $('td[data-result-id="' + _.first(results).id + '"]').addClass('hc-best-result');
            }

        });        
    },

    calculate_points: function() {
        _.each(window.Competition.competitors, function(competitor) {
            _.each(window.Competition.rounds, function(round) {
                var result_cell = $('#competitor_' + competitor.id + '>' +
                                  'td[data-round-id=' + round.id + ']' +
                                  '[data-role=result]');
                var points_cell = $('#competitor_' + competitor.id + '>' +
                                  'td[data-round-id=' + round.id + ']' +
                                  '[data-role=points]');
                var result = +result_cell.text();

                var max_result_for_round = window.Competition.max_results['round_' + round.id];
                var max_val = max_result_for_round ? max_result_for_round[0].result : result;

                if (result) {
                    var points = Math.round(result / max_val * 1000) / 10;
                    points_cell.text(points.toFixed(1)); 
                } else {
                    points_cell.text('');
                }

            }); 
        });    
    },

    sort_by_points: function() {
        this.$el.find('tbody').each(function(index, value) {
            var rows = $(value).find('tr:not(.head-row)').get();
            
            rows.sort(function(a, b) {
                var A = +$(a).children('td[data-role="total-points"]').text();
                var B = +$(b).children('td[data-role="total-points"]').text();

                if(A > B) {
                    return -1;
                }

                if(A < B) {
                    return 1;
                }

                return 0;
            });
            
            $.each(rows, function(index, row) {
                $(value).append(row);
            });
        });
    },
   
    after_results_changes: function() {
        this.calculate_totals();
        this.sort_by_points();
    },

    render_total_points: function() {
        this.$discipline_row.append(
            $('<td>')
                .addClass('text-center')
                .text(I18n.t('events.show.total'))
                .attr('rowspan', 3)
                .attr('data-role', 'total-points')
        );
        this.$template_row.append(
            $('<td>').addClass('text-right').attr('data-role', 'total-points')
        );
        this.row_length += 1;
    },

    render_table_footer: function() {
        $('#table-footer > tr').append(
            $('<td>').attr('colspan', 2)
        );

        this.$table_footer = $('#table-footer');
        this.$table_footer_row = $('#table-footer > tr');

        var footer_row = this.$table_footer_row;

        var rounds_by_discipline = 
            _.groupBy(window.Competition.rounds, 'discipline');

        _.each(rounds_by_discipline, function(rounds, discipline) {
            _.each(rounds, function(round) {
                var signed_cell = 
                    $('<td>')
                        .addClass('text-center')
                        .addClass('text-success')
                        .attr('colspan', 2)
                        .text(' Signed')
                        .prepend($('<i>').addClass('fa').addClass('fa-lock'));
                if (!round.signed_off) {
                    signed_cell =
                        $('<td>')
                            .addClass('text-center')
                            .addClass('text-danger')
                            .attr('colspan', 2)
                            .text(' Not signed')
                            .prepend($('<i>').addClass('fa').addClass('fa-unlock'));
                }
                footer_row.append(signed_cell);
            });
            footer_row.append($('<td>'));
        });

        var total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
        if (total_points_cell.length) {
             var signed_cell =
                $('<td>')
                    .addClass('text-center')
                    .addClass('text-danger')
                    .attr('colspan', 2)
                    .text(' Not signed')
                    .prepend($('<i>').addClass('fa').addClass('fa-unlock'));
            footer_row.append(signed_cell);
        }
    },

    render: function() {
        // Disciplines, Rounds
        var rounds_by_discipline = this.model.rounds.groupBy('discipline');
        _.each(rounds_by_discipline, this.render_discipline.bind(this));

        if (window.Competition.rounds.length) {
            this.render_total_points();
        }

        // Sections
        window.Competition.sections.each(this.render_section.bind(this));

        // Competitors
        window.Competition.competitors.each(this.render_competitor.bind(this));

        // Results
        window.Competition.tracks.each(this.render_result.bind(this));
        
        // Table footer
        this.$el.append(
            $('<tbody>').attr('id', 'table-footer').append($('<tr>'))
        );
        if (window.Competition.is_official && window.Competition.can_manage) {
            this.render_table_footer();
        }

        this.calculate_totals();
        this.sort_by_points();
        this.set_row_numbers();
    },

    ///////////////////////////////////////////////////
    // Manipulations
    //

    order_sections: function() {
        var sections = this.$el.find('tbody').get();
        sections.sort(function(a, b) {

            if ($(b).attr('id') === 'table-footer') return -1;

            var A = Number($(a).attr('data-order'));
            var B = Number($(b).attr('data-order'));

            if (A > B) return 1;
            if (A < B) return -1;
            return 0;

        });

        var $el = this.$el;

        $.each(sections, function(index, section) {
            $el.append(section);
        });
    },
   

    move_sections: function(section, direction) {
        var $section = this.$el.find('#section_' + section.id);
        var tmp = $section.attr('data-order');

        if (direction == 'up') {
            var $prev_section = $section.prev();
            $section.insertBefore($prev_section);
            
            $section.attr('data-order', $prev_section.attr('data-order'));
            $prev_section.attr('data-order', tmp);
        } else {
            var $next_section = $section.next();
            $section.insertAfter($next_section);

            $section.attr('data-order', $next_section.attr('data-order'));
            $next_section.attr('data-order', tmp);
        }
    },

    // Competitors 

    create_competitor: function(competitor) {
        this.render_competitor(competitor);
        this.set_row_numbers();
    },

    update_competitor: function(competitor) {
        var competitor_row = $('#competitor_' + competitor.id);

        competitor_row.find("[data-role='competitor-name']")
            .attr('href', competitor.profile.url)
            .text(competitor.profile.name + ' ');
        competitor_row.find("[data-role='competitor-suit']").text(competitor.wingsuit.name);
        competitor_row.find("[data-role='competitor-country']")
            .text(competitor.country.code.toUpperCase())
            .attr('title', competitor.country.name);

        var current_section = competitor_row.closest('tbody').data('id');

        if (competitor.section.id != current_section) {
            $('#section_' + competitor.section.id).append(
                competitor_row
                    .remove()
                    .clone()
            );
        }

        this.set_row_numbers();
    },

    delete_competitor: function(competitor) {
        $('#competitor_' + competitor.id).remove();
        this.calculate_points();
        this.set_row_numbers();
    },

    // Rounds
    
    create_round: function(round) {
        // 1. Проверить наличие дисциплины
        var discipline = round.discipline;
        var discipline_cell = $('#disciplines-row > td[data-discipline="' + discipline + '"]');
        var total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
        var addition_colspan = 0;

        if (!total_points_cell.length) {
            // header and template row
            this.render_total_points();
            // existent competitors rows
            $('#results-table > tbody > tr.competitor-row').each(function() {
                $(this).append($('<td>').attr('data-role', 'total-points'));
            });        

            total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
            addition_colspan += 1;
        }

        // 2. Создать дисциплину если отсутствует
        // 3. Увеличить colspan если присутствует
        if (!discipline_cell.length) {
            var discipline_colspan = this.rules === 'hungary_boogie' ? 1 : 3;
            // discipline
            total_points_cell.before(
                $('<td>')
                    .text(I18n.t('disciplines.' + discipline))
                    .addClass('text-center')
                    .attr('data-discipline', discipline)
                    .attr('colspan', discipline_colspan)   
            );
            if (this.rules !== 'hungary_boogie') {
                // discipline points
                this.$rounds_row.append(
                    $('<td>')
                        .text('%')
                        .attr('data-discipline', discipline)
                        .attr('data-role', 'points')
                        .attr('rowspan', 2)   
                );
                // template row discipline points
                this.$template_row.find('td[data-role="total-points"]').before(
                    $('<td>')
                        .addClass('text-right')
                        .attr('data-discipline', discipline)
                        .attr('data-role', 'points')
                );
                // competitor rows discipline points
                $('#results-table > tbody > tr.competitor-row').each(function() {
                    $(this).find('td[data-role="total-points"]').before(
                        $('<td>')
                            .addClass('text-right')
                            .attr('data-discipline', discipline)
                            .attr('data-role', 'points')
                    );
                });        
                addition_colspan += 1;
            }
        } else {
            var colspan = +discipline_cell.attr('colspan');
            discipline_cell.attr('colspan', colspan + (this.rules === 'hungary_boogie' ? 1 : 2));
        }

        var can_manage = window.Competition.can_manage;
        // 4. Добавить раунд
        if (this.rules === 'hungary_boogie') {
            this.$rounds_row.append(
                this.round_cell(
                    $.extend(round, {can_manage: can_manage, rules: this.rules})
            ));
        } else {
            $('#rounds-row > td[data-discipline=' + discipline + '][data-role="points"]').before(
                this.round_cell(
                    $.extend(round, {can_manage: can_manage, rules: this.rules})
            ));
        }

        var units_selector = '#units-row > td[data-role="points"]';
        if ($('#units-row > td[data-discipline=' + discipline + ']').length) {
            units_selector += '[data-discipline=' + discipline + ']';
        }
        units_selector += ':last';

        var percent_cell = 
            $('<td>')
                .text('%')
                .addClass('text-center')
                .attr('data-discipline', discipline)
                .attr('data-role', 'points')
                .attr('data-round-id', round.id);

        var unit_cell =
            $('<td>')
                .text(this.units[discipline])
                .addClass('text-center')
                .attr('data-discipline', discipline)
                .attr('data-role', 'unit')
                .attr('data-round-id', round.id);

        var result_cell = this.result_cell({
            id: round.id,
            role: 'result',
            can_manage: can_manage
        });

        var points_cell = this.result_cell({
            id: round.id,
            role: 'points',
            can_manage: can_manage
        });

        if (this.rules === 'hungary_boogie') {

            if ($(units_selector).length) {
                $(units_selector).after(unit_cell);
            } else {
                this.$units_row.append(unit_cell);
            }

            $('.template-row > td[data-role="total-points"]')
                .before($(result_cell).clone());

            addition_colspan += 1;

            // 5. Добавить ячейки участникам
            $('.competitor-row > td[data-role="total-points"]').each(function() {
                $(this).before($(result_cell).clone());
            }); 

        } else {

            if ($(units_selector).length) {
                $(units_selector).after(percent_cell).after(unit_cell);
            } else {
                this.$units_row.append(unit_cell).append(percent_cell);
            }

            $('.template-row > td[data-discipline=' + discipline + '][data-role="points"]')
                .before($(result_cell).clone())
                .before($(points_cell).clone());

            addition_colspan += 2;

            // 5. Добавить ячейки участникам
            $('.competitor-row > td[data-discipline=' + discipline + '][data-role="points"]').each(function() {
                $(this) 
                    .before($(result_cell).clone())
                    .before($(points_cell).clone());
            }); 
        }

        // 6. Увеличить colspan в секциях
        $('#results-table > tbody > tr.head-row > td').each(function() {
            $(this).attr('colspan', +$(this).attr('colspan') + addition_colspan);
        });

    },

    delete_round: function(round) {
        var del_discipline = _.where(
                window.Competition.rounds, 
                {discipline: round.discipline}
            ).length == 1;

        var del_total = window.Competition.rounds.length == 1;

        // Удалить ячейки в строках участников
        // Удалить ячейки в шаблоне
        // Удалить раунд
        // Удалить единицы измерения
        $('.competitor-row > td[data-round-id=' + round.id + '], '
            + '.template-row > td[data-round-id=' + round.id + '], '
            + '#rounds-row > td[data-round-id=' + round.id + '], '
            + '#units-row > td[data-round-id=' + round.id + ']').remove();

        var discipline_cell = $('#disciplines-row > td[data-discipline=' + round.discipline + ']');
        if (del_discipline) {
            $('td[data-discipline=' + round.discipline + '][data-role="points"]').remove(); 
            discipline_cell.remove();
        } else {
            // уменьшить colspan
            var colspan = +discipline_cell.attr('colspan');
            discipline_cell.attr('colspan', colspan - (this.rules === 'hungary_boogie' ? 1 : 2));
        }

        if (del_total) {
            $('td[data-role="total-points"]').remove();
        }
        // Уменьшить colspan в секциях
        $('#results-table > tbody > tr.head-row > td').each(function() {
            var colspan_diff = (this.rules === 'hungary_boogie' ? 1 : 2) + (del_total ? 1 : 0) + (del_discipline ? 1 : 0);
            $(this).attr('colspan', +$(this).attr('colspan') - colspan_diff);
        });
    },

    after_rounds_changed: function() {
        // Пересчитать итоги по дисциплинам
        this.calculate_totals();
    },

    create_result: function(result) {
        var result_cell = $('#competitor_' + result.competitor_id + ' > ' +
                            'td[data-round-id=' + result.round_id + ']' + 
                            '[data-role=result]');
        var points_cell = $('#competitor_' + result.competitor_id + ' > ' +
                            'td[data-round-id=' + result.round_id + ']' + 
                            '[data-role=points]');

        result_cell.text(result.result);
        result_cell.attr('data-result-id', result.id);
        result_cell.attr('data-track-id', result.track_id);
        result_cell.attr('data-url', result.url);

        points_cell.attr('data-result-id', result.id);

        this.calculate_points();
        this.calculate_totals();
        this.sort_by_points();
        this.set_row_numbers();
    },

    delete_result: function(result) {
        var result_cell = $('td[data-result-id=' + result.id + ']');
        var points_cell = 
            result_cell.closest('tr')
                .find('td[data-round-id=' + 
                         result_cell.data('round-id') + 
                         '][data-role=points]');


        result_cell.text('');
        result_cell.attr('data-result-id', '');
        result_cell.attr('data-track-id', '');
        result_cell.attr('data-url', '');

        points_cell.text('');

        this.calculate_points();
        this.calculate_totals();
        this.sort_by_points();
        this.set_row_numbers();
    }
});
