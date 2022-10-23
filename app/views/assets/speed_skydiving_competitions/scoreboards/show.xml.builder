xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-speed-skydiving-#{@event.id}-#{category_name}"

  standings.each do |row|
    xml.Entrant do
      xml.CompetitionNo row[:competitor].assigned_number
      xml.Name row[:competitor].name
      xml.Nation row[:competitor].country_code
      xml.Rank row[:rank]
      xml.Total row[:total]
      xml.Average row[:average]
      @event.rounds.ordered.each do |round|
        xml.Round(No: round.number) do
          result = row[:results].find { _1.round == round }
          xml.Result result&.final_result&.round(2) || ''
          if result
            xml.Notes(<<~HTML)
              <iframe src=\"#{speed_skydiving_competition_result_iframe_url(@event.id, result.id)}"
                      height="550px"
                      width="750px" />
            HTML
          end
        end
      end
    end
  end
end
